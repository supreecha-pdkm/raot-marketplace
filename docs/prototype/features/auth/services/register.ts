import {
  submitApplication,
  type BankAccount,
  type RegistrationDoc,
} from '@/features/approvals/services/approval-data';
import type { Role } from '../types/register';

interface AuthorizedPerson {
  title?: string;
  firstName?: string;
  lastName?: string;
  position?: string;
  delegated?: 'delegated' | 'not_delegated';
}

interface Representative {
  title?: string;
  firstName?: string;
  lastName?: string;
  nationalId?: string;
}

const INSTITUTIONAL_SUBTYPES = ['cooperative', 'business', 'farmer_group', 'organization'] as const;

export interface SubmitRegistrationParams {
  role: Role;
  values: Record<string, unknown>;
  docs: RegistrationDoc[];
  username: string;
  password: string;
}

/**
 * Build the application payload from raw form values and persist it.
 *
 * Routing rules:
 * - For institutional seller subTypes and buyer-company, the top-level
 *   title/firstName/lastName mirror the authorized person so the officer
 *   view continues to show a human contact name.
 * - For farmer + individual buyer, top-level is the applicant themselves.
 */
export function submitRegistration({
  role,
  values,
  docs,
  username,
  password,
}: SubmitRegistrationParams) {
  const subType = (values.subType as string | undefined) ?? '';
  const isInstitutional = role === 'seller' && (INSTITUTIONAL_SUBTYPES as readonly string[]).includes(subType);
  const isBuyerCompany = role === 'buyer' && subType === 'company';
  const ap = (values.authorizedPerson ?? {}) as AuthorizedPerson;
  const rep = (values.representative ?? {}) as Representative;
  const dob = values.dob as { format?: (fmt: string) => string } | string | undefined;

  return submitApplication({
    type: role,
    subType,
    username,
    title: (isInstitutional || isBuyerCompany ? ap.title : (values.title as string)) ?? '',
    firstName: (isInstitutional || isBuyerCompany ? ap.firstName : (values.firstName as string)) ?? '',
    lastName: (isInstitutional || isBuyerCompany ? ap.lastName : (values.lastName as string)) ?? '',
    dob: isBuyerCompany
      ? ''
      : dob
        ? (typeof dob === 'object' && dob.format ? dob.format('YYYY-MM-DD') : String(dob))
        : '',
    nationalId: isBuyerCompany
      ? ((values.taxId as string) ?? '')
      : ((values.nationalId as string) ?? ''),
    phone: (values.phone as string) ?? '',
    email: (values.email as string) ?? '',
    addressLine: (values.addressLine as string) ?? '',
    province: (values.province as string) ?? '',
    district: (values.district as string) ?? '',
    subDistrict: (values.subDistrict as string) ?? '',
    zipcode: (values.zipcode as string) ?? '',
    ...(role === 'buyer'
      ? {
          markets: (values.markets as string[]) ?? [],
          ...(isBuyerCompany
            ? {
                orgName: (values.orgName as string) ?? '',
                taxId: (values.taxId as string) ?? '',
                authorizedPerson: {
                  title: ap.title ?? '',
                  firstName: ap.firstName ?? '',
                  lastName: ap.lastName ?? '',
                  position: ap.position ?? '',
                  delegated: ap.delegated,
                },
              }
            : {}),
        }
      : {}),
    ...(role === 'seller'
      ? {
          market: (values.market as string) ?? '',
          rubberTypes: (values.rubberTypes as string[]) ?? [],
          ...(subType === 'farmer' ? { farmerRegNo: (values.farmerRegNo as string) ?? '' } : {}),
          ...(subType === 'cooperative'
            ? {
                orgName: (values.orgName as string) ?? '',
                taxId: (values.taxId as string) ?? '',
                instRegNo: (values.instRegNo as string) ?? '',
              }
            : {}),
          ...(subType === 'business'
            ? {
                orgName: (values.orgName as string) ?? '',
                commerceRegNo: (values.commerceRegNo as string) ?? '',
                businessRegNo: (values.businessRegNo as string) ?? '',
              }
            : {}),
          ...(subType === 'farmer_group' ? { orgName: (values.orgName as string) ?? '' } : {}),
          ...(subType === 'organization'
            ? {
                orgName: (values.orgName as string) ?? '',
                taxId: (values.taxId as string) ?? '',
              }
            : {}),
          ...(isInstitutional
            ? {
                authorizedPerson: {
                  title: ap.title ?? '',
                  firstName: ap.firstName ?? '',
                  lastName: ap.lastName ?? '',
                  position: ap.position ?? '',
                  ...(subType !== 'farmer_group' ? { delegated: ap.delegated } : {}),
                },
              }
            : {}),
          ...(subType === 'farmer_group'
            ? {
                representative: {
                  title: rep.title ?? '',
                  firstName: rep.firstName ?? '',
                  lastName: rep.lastName ?? '',
                  nationalId: rep.nationalId ?? '',
                },
              }
            : {}),
        }
      : {}),
    ...(() => {
      const accounts = (values.bankAccounts as BankAccount[] | undefined) ?? [];
      const idx = Math.max(
        0,
        Math.min(accounts.length - 1, Number(values.primaryBankIndex ?? 0)),
      );
      const primary = accounts[idx] ?? {
        bank: '', accountNo: '', accountName: '', branch: '', accountType: 'savings' as const,
      };
      return {
        bank: primary.bank ?? '',
        accountNo: primary.accountNo ?? '',
        accountName: primary.accountName ?? '',
        branch: primary.branch ?? '',
        accountType: primary.accountType ?? 'savings',
        bankAccounts: accounts,
        primaryBankIndex: idx,
      };
    })(),
    docs,
    password,
  });
}
