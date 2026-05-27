'use client';

import { useCallback, useEffect, useState } from 'react';
import { Form, App as AntApp } from 'antd';
import dayjs from 'dayjs';
import {
  HIGH_PRICE_MULTIPLIER, REVIEW_COUNTDOWN_SEC, HIGH_PRICE_COUNTDOWN_SEC,
  MIN_BID_INCREMENT,
} from '@/features/auctions/utils/auction-constants';
import {
  getRoundById, getRoundPhaseForRubberType,
} from '@/features/auctions/services/auction-rounds';
import type { RubberRow } from '@/features/auctions/services/auction-mock';

// ─── Public types ─────────────────────────────────────────────────────────────
export interface RoundOffer {
  /** AuctionRound.id this offer was placed against (admin-configured round). */
  roundId:  string;
  rowKey:   string;       // matches RubberRow.key
  typeName: string;
  grade:    string;
  myPrice:  number | null;
}

export interface ConfirmSubmitState {
  row:              RubberRow;
  price:            number;
  isHigh:           boolean;       // price > openingPrice × HIGH_PRICE_MULTIPLIER
  initialCountdown: number;        // seconds the confirm button starts locked
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
/**
 * Encapsulates the entire two-step offer flow for the auction board:
 *
 *   1. Buyer clicks "เสนอราคา" on a card → `openOffer(row)` opens the offer
 *      modal with the photo gallery + price form.
 *   2. Form submit → `handleOfferFormSubmit({price})` opens the confirm
 *      modal on top, with a review countdown (longer if the bid is high).
 *   3. `confirmAndSubmit()` writes the offer once the countdown elapses.
 *
 * `selectedRoundId` is required because each round has its own set of
 * `RoundOffer`s — switching rounds should show different "my offer" pills
 * on the cards even though the same buyer/lot is involved. Pass `null`
 * before a round is picked; no offers will be returned for that case.
 *
 * The success splash + auto-close behavior is handled inside the hook;
 * callers only render two modals and wire props.
 */
/** Modal target — also carries the previously-saved bid (if any) for this
 *  round/row pair so the form can switch its validation rules between "new"
 *  and "edit" mode. */
export interface OfferModalTarget {
  row:           RubberRow;
  /** Existing bid the buyer placed earlier in this same round (edit mode).
   *  Null when the buyer is bidding for the first time. */
  existingPrice: number | null;
}

const OFFERS_KEY = 'raot_my_offers';

export function useOfferFlow(selectedRoundId: string | null) {
  const { message } = AntApp.useApp();

  // Offer modal
  const [offerModal,   setOfferModal]   = useState<OfferModalTarget | null>(null);
  const [offerForm]                     = Form.useForm<{ price: number }>();
  const [offerSuccess, setOfferSuccess] = useState(false);
  const [previewIdx,   setPreviewIdx]   = useState(0);
  const [myOffers, setMyOffers] = useState<RoundOffer[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem(OFFERS_KEY) ?? '[]') as RoundOffer[];
    } catch {
      return [];
    }
  });
  // Mirror every state update back into localStorage.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(OFFERS_KEY, JSON.stringify(myOffers));
  }, [myOffers]);

  // Confirm modal (review-before-send)
  const [confirmSubmit, setConfirmSubmit] = useState<ConfirmSubmitState | null>(null);
  const [countdownSec,  setCountdownSec]  = useState(0);
  const [submitting,    setSubmitting]    = useState(false);

  /** Returns true iff the selected round is currently still open. Used as a
   *  defensive guard at submit-time: the modal could be opened (or armed) a
   *  few seconds before close and then commit after the round has ended. */
  const isRoundStillOpen = useCallback((typeKey: string): boolean => {
    if (!selectedRoundId) return false;
    const round = getRoundById(selectedRoundId);
    if (!round) return false;
    return getRoundPhaseForRubberType(round, dayjs(), typeKey) === 'open';
  }, [selectedRoundId]);

  // ── Actions ────────────────────────────────────────────────────────────
  const openOffer = useCallback((row: RubberRow) => {
    if (!selectedRoundId) return;
    // First guard — buyer can't open the bid form once the round has closed.
    // The board buttons are already disabled in that state, but this is the
    // safety net for any other entry point (deep link, race condition, etc.).
    if (!isRoundStillOpen(row.typeKey)) {
      message.warning('รอบประมูลของชนิดยางนี้ปิดแล้ว — ไม่สามารถเสนอราคาได้');
      return;
    }
    const existing      = myOffers.find(o => o.roundId === selectedRoundId && o.rowKey === row.key);
    const existingPrice = existing?.myPrice ?? null;
    // Prefill: edit mode keeps the previous bid as the starting point; new
    // bids start at the minimum allowable price (opening + increment).
    offerForm.setFieldsValue({
      price: existingPrice ?? (row.openingPrice + MIN_BID_INCREMENT),
    });
    setOfferModal({ row, existingPrice });
    setOfferSuccess(false);
    setPreviewIdx(0);
  }, [myOffers, selectedRoundId, offerForm, isRoundStillOpen, message]);

  const closeOffer = useCallback(() => {
    setOfferModal(null);
  }, []);

  // Form submit → arms the inline review countdown (offer not written yet).
  const handleOfferFormSubmit = useCallback((values: { price: number }) => {
    if (!offerModal) return;
    // Second guard — between opening the form and clicking submit the round
    // may have closed. Abort the arm and close the modal so the buyer sees
    // the closed-state UI.
    if (!isRoundStillOpen(offerModal.row.typeKey)) {
      message.warning('รอบประมูลของชนิดยางนี้ปิดระหว่างกรอกราคา — ไม่สามารถส่งราคาได้');
      setOfferModal(null);
      return;
    }
    const highThreshold = offerModal.row.openingPrice * HIGH_PRICE_MULTIPLIER;
    const isHigh        = values.price > highThreshold;
    const initial       = isHigh ? HIGH_PRICE_COUNTDOWN_SEC : REVIEW_COUNTDOWN_SEC;
    setConfirmSubmit({ row: offerModal.row, price: values.price, isHigh, initialCountdown: initial });
    setCountdownSec(initial);
  }, [offerModal, isRoundStillOpen, message]);

  const cancelConfirm = useCallback(() => {
    if (submitting) return;
    setConfirmSubmit(null);
    setCountdownSec(0);
  }, [submitting]);

  // Confirm button → actually record the offer + show success state.
  const confirmAndSubmit = useCallback(async () => {
    if (!confirmSubmit || countdownSec > 0 || submitting || !selectedRoundId) return;
    // Third guard — the review countdown can lapse a few seconds after the
    // round closes. Reject the commit and reset back to the form step so the
    // buyer isn't stranded on an armed-but-frozen dialog.
    if (!isRoundStillOpen(confirmSubmit.row.typeKey)) {
      message.error('รอบประมูลของชนิดยางนี้ปิดก่อนยืนยัน — ราคานี้ไม่ถูกบันทึก');
      setConfirmSubmit(null);
      setCountdownSec(0);
      setOfferModal(null);
      return;
    }
    setSubmitting(true);
    try {
      // Simulate a network round-trip — swap for a real API call.
      await new Promise(r => setTimeout(r, 700));
      setMyOffers(prev => {
        const next = prev.filter(o => !(o.roundId === selectedRoundId && o.rowKey === confirmSubmit.row.key));
        return [...next, {
          roundId:  selectedRoundId,
          rowKey:   confirmSubmit.row.key,
          typeName: confirmSubmit.row.typeName,
          grade:    confirmSubmit.row.grade,
          myPrice:  confirmSubmit.price,
        }];
      });
      setOfferSuccess(true);
      setConfirmSubmit(null);
      setCountdownSec(0);
      // Auto-close the offer modal after the success splash.
      setTimeout(() => { setOfferModal(null); setOfferSuccess(false); }, 1800);
    } finally {
      setSubmitting(false);
    }
  }, [confirmSubmit, countdownSec, submitting, selectedRoundId, isRoundStillOpen, message]);

  const deleteOffer = useCallback((rowKey: string) => {
    if (!selectedRoundId) return;
    setMyOffers(prev =>
      prev.filter(o => !(o.roundId === selectedRoundId && o.rowKey === rowKey)),
    );
  }, [selectedRoundId]);

  // ── Countdown tick ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!confirmSubmit || countdownSec <= 0) return;
    const id = setTimeout(() => setCountdownSec(s => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(id);
  }, [confirmSubmit, countdownSec]);

  // ── Auto-close on round-close ──────────────────────────────────────────
  // While the modal is open we poll the round window every second. The
  // moment the round transitions to closed we close the modal so the buyer
  // can't sit on a half-completed bid that would be rejected at submit.
  useEffect(() => {
    if (!offerModal || submitting) return;
    const id = setInterval(() => {
      if (!isRoundStillOpen(offerModal.row.typeKey)) {
        message.warning('รอบประมูลของชนิดยางนี้ปิดแล้ว — ปิดหน้าต่างเสนอราคาอัตโนมัติ');
        setConfirmSubmit(null);
        setCountdownSec(0);
        setOfferModal(null);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [offerModal, submitting, isRoundStillOpen, message]);

  // ── Derived ────────────────────────────────────────────────────────────
  const currentRoundOffers = selectedRoundId
    ? myOffers.filter(o => o.roundId === selectedRoundId)
    : [];

  return {
    // Offer modal
    offerModal,
    offerForm,
    offerSuccess,
    previewIdx,
    setPreviewIdx,

    // Confirm modal
    confirmSubmit,
    countdownSec,
    submitting,

    // All offers (across rounds) + current-round slice
    myOffers,
    currentRoundOffers,

    // Actions
    openOffer,
    closeOffer,
    handleOfferFormSubmit,
    cancelConfirm,
    confirmAndSubmit,
    deleteOffer,
  };
}
