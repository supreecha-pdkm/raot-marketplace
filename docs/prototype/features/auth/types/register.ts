import type { Form } from 'antd';

export type Role = 'buyer' | 'seller';
export type StepKey = 'pdpa' | 'personal' | 'bank' | 'creds' | 'docs';

export type DistrictOption = { name: string };

export interface AddressStepProps {
  form: ReturnType<typeof Form.useForm>[0];
  selectedProvince: string | undefined;
  selectedDistrict: string | undefined;
  districtOptions: DistrictOption[];
  subDistrictOptions: DistrictOption[];
}
