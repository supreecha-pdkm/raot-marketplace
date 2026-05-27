import type { StepKey } from '../../types/register';

/** Thai national ID checksum validator (per SRS step 1, validate checksum). */
export function validateThaiId(id: string): boolean {
  if (!/^\d{13}$/.test(id)) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += parseInt(id[i], 10) * (13 - i);
  return (11 - (sum % 11)) % 10 === parseInt(id[12], 10);
}

/** Password rule per SRS: ≥8 chars, upper + lower + digit + special. */
export function passwordRule(_: unknown, value: string): Promise<void> {
  if (!value) return Promise.reject(new Error('กรุณากรอกรหัสผ่าน'));
  if (value.length < 8) return Promise.reject(new Error('รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร'));
  if (!/[A-Z]/.test(value)) return Promise.reject(new Error('ต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว'));
  if (!/[a-z]/.test(value)) return Promise.reject(new Error('ต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว'));
  if (!/\d/.test(value)) return Promise.reject(new Error('ต้องมีตัวเลขอย่างน้อย 1 ตัว'));
  if (!/[^A-Za-z0-9]/.test(value)) return Promise.reject(new Error('ต้องมีอักขระพิเศษอย่างน้อย 1 ตัว'));
  return Promise.resolve();
}

/** Returns the field names (path or string) that must pass validation before advancing from each step. */
export function getStepFields(
  key: StepKey,
  isSeller: boolean,
  subType: string | undefined,
): (string | (string | number)[])[] {
  const sellerAddressFields = [
    'addressLine', 'province', 'district', 'subDistrict', 'zipcode',
    'email', 'phone',
  ];
  const buyerAddressFields = [
    'addressLine', 'province', 'district', 'subDistrict', 'zipcode',
    'email', 'phone',
  ];

  const authorizedFields: (string | number)[][] = [
    ['authorizedPerson', 'title'],
    ['authorizedPerson', 'firstName'],
    ['authorizedPerson', 'lastName'],
    ['authorizedPerson', 'position'],
  ];
  const authorizedWithDelegated: (string | number)[][] = [
    ...authorizedFields,
    ['authorizedPerson', 'delegated'],
  ];

  const representativeFields: (string | number)[][] = [
    ['representative', 'title'],
    ['representative', 'firstName'],
    ['representative', 'lastName'],
    ['representative', 'nationalId'],
  ];

  switch (key) {
    case 'pdpa':
      return [
        'pdpaAccept',
        'subType',
        ...(isSeller ? ['rubberTypes', 'market'] : ['markets']),
      ];
    case 'personal': {
      if (!isSeller) {
        if (subType === 'company') {
          return [
            'orgName', 'taxId',
            ...authorizedWithDelegated,
            'addressLine', 'province', 'district', 'subDistrict', 'zipcode',
            'email', 'phone',
          ];
        }
        return [
          'title', 'firstName', 'lastName', 'nationalId', 'dob',
          ...buyerAddressFields,
        ];
      }
      const base = sellerAddressFields;
      switch (subType) {
        case 'farmer':
          return [
            'title', 'firstName', 'lastName', 'dob', 'nationalId', 'farmerRegNo',
            ...base,
          ];
        case 'cooperative':
          return [
            'orgName', 'taxId', 'instRegNo',
            ...authorizedWithDelegated,
            ...base,
          ];
        case 'business':
          return [
            'orgName', 'commerceRegNo',
            ...authorizedWithDelegated,
            ...base,
          ];
        case 'farmer_group':
          return [
            'orgName',
            ...authorizedFields,
            ...representativeFields,
            ...base,
          ];
        case 'organization':
          return [
            'orgName', 'taxId',
            ...authorizedWithDelegated,
            ...base,
          ];
        default:
          return [];
      }
    }
    case 'bank':
      return ['bankAccounts', 'primaryBankIndex'];
    case 'creds':
      return ['username', 'password', 'confirmPassword'];
    case 'docs':
      return [
        'docIdCard', 'docHouseReg', 'docBankBook', 'docPdpa',
        ...(!isSeller && subType === 'company'
          ? ['docCompanyCert', 'docDirectorId', 'docPoa']
          : []),
        ...(isSeller && (subType === 'cooperative' || subType === 'farmer_group' || subType === 'organization')
          ? ['docOrgCert']
          : []),
        ...(isSeller && subType === 'business' ? ['docFactoryLicense', 'docCompanyCert'] : []),
      ];
  }
}
