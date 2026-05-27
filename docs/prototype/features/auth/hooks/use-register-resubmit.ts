'use client';

import { useEffect, useState } from 'react';
import type { Form, UploadFile } from 'antd';
import dayjs from 'dayjs';
import {
  getAllApplications,
  getPendingCred,
} from '@/features/approvals/services/approval-data';
import { DOC_DEFS } from '../constants/register';
import type { Role } from '../types/register';

type FormInstance = ReturnType<typeof Form.useForm>[0];

interface UseRegisterResubmitParams {
  resubmitId: string;
  role: Role | string;
  form: FormInstance;
}

interface UseRegisterResubmitResult {
  prefilled: boolean;
  resubmitUsername: string;
  resubmitPassword: string;
}

/**
 * Prefill the form from a previous rejected application.
 *
 * Triggered by /register/{role}?resubmit={appId} (link from the pending
 * status page). Loads the old payload and seeds every field — including
 * re-hydrating each uploaded doc as a real File so the user can re-submit
 * without having to attach the same files again.
 */
export function useRegisterResubmit({
  resubmitId,
  role,
  form,
}: UseRegisterResubmitParams): UseRegisterResubmitResult {
  const [prefilled, setPrefilled] = useState(false);
  const [resubmitUsername, setResubmitUsername] = useState('');
  const [resubmitPassword, setResubmitPassword] = useState('');

  useEffect(() => {
    if (!resubmitId) return;
    if (role !== 'buyer' && role !== 'seller') return;
    let cancelled = false;

    (async () => {
      const prev = getAllApplications().find(
        (a) => a.id === resubmitId && a.type === role,
      );
      if (!prev) return;

      const docFields: Record<string, UploadFile[]> = {};
      for (const doc of prev.docs) {
        const def = DOC_DEFS.find((d) => d.type === doc.type);
        if (!def || !doc.dataUrl) continue;
        try {
          const res = await fetch(doc.dataUrl);
          const blob = await res.blob();
          const mimeType = doc.mimeType || blob.type;
          const file = new File([blob], doc.filename, { type: mimeType });
          docFields[def.key] = [{
            uid: doc.id,
            name: doc.filename,
            status: 'done',
            originFileObj: file as UploadFile['originFileObj'],
            type: mimeType,
            size: file.size,
          }];
        } catch (e) {
          console.warn('resubmit: skipping doc', doc.id, e);
        }
      }
      if (cancelled) return;

      setResubmitUsername(prev.username);
      const existingCred = getPendingCred(prev.username);
      if (existingCred?.password) setResubmitPassword(existingCred.password);

      form.setFieldsValue({
        pdpaAccept: true,
        subType: prev.subType,
        ...(prev.markets ? { markets: prev.markets } : {}),
        ...(prev.market ? { market: prev.market } : {}),
        ...(prev.rubberTypes ? { rubberTypes: prev.rubberTypes } : {}),
        title: prev.title,
        firstName: prev.firstName,
        lastName: prev.lastName,
        nationalId: prev.nationalId,
        dob: prev.dob ? dayjs(prev.dob) : undefined,
        phone: prev.phone,
        email: prev.email,
        addressLine: prev.addressLine,
        province: prev.province,
        district: prev.district,
        subDistrict: prev.subDistrict,
        zipcode: prev.zipcode,
        ...(prev.farmerRegNo !== undefined ? { farmerRegNo: prev.farmerRegNo } : {}),
        ...(prev.orgName !== undefined ? { orgName: prev.orgName } : {}),
        ...(prev.taxId !== undefined ? { taxId: prev.taxId } : {}),
        ...(prev.instRegNo !== undefined ? { instRegNo: prev.instRegNo } : {}),
        ...(prev.commerceRegNo !== undefined ? { commerceRegNo: prev.commerceRegNo } : {}),
        ...(prev.businessRegNo !== undefined ? { businessRegNo: prev.businessRegNo } : {}),
        ...(prev.authorizedPerson ? { authorizedPerson: prev.authorizedPerson } : {}),
        ...(prev.representative ? { representative: prev.representative } : {}),
        bankAccounts:
          prev.bankAccounts && prev.bankAccounts.length > 0
            ? prev.bankAccounts
            : [{
                bank: prev.bank,
                accountNo: prev.accountNo,
                accountName: prev.accountName,
                branch: prev.branch,
                accountType: prev.accountType,
              }],
        primaryBankIndex: prev.primaryBankIndex ?? 0,
        ...docFields,
      });
      setPrefilled(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [resubmitId, role, form]);

  return { prefilled, resubmitUsername, resubmitPassword };
}
