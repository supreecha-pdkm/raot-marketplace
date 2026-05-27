/**
 * Cascading Thai administrative address data: จังหวัด → อำเภอ → ตำบล + รหัสไปรษณีย์.
 * Scoped to the 9 southern provinces shown in the registration form (RAOT rubber
 * markets are concentrated in the south). Each tambon carries its postal code so
 * the form can auto-fill zipcode once the user picks ตำบล.
 */

export interface SubDistrict {
  name: string;
  zipcode: string;
}

export interface District {
  name: string;
  subDistricts: SubDistrict[];
}

export interface Province {
  name: string;
  districts: District[];
}

export const THAI_ADDRESS: Province[] = [
  {
    name: 'สุราษฎร์ธานี',
    districts: [
      {
        name: 'เมืองสุราษฎร์ธานี',
        subDistricts: [
          { name: 'ตลาด', zipcode: '84000' },
          { name: 'มะขามเตี้ย', zipcode: '84000' },
          { name: 'บางใบไม้', zipcode: '84000' },
          { name: 'บางกุ้ง', zipcode: '84000' },
          { name: 'คลองฉนาก', zipcode: '84000' },
        ],
      },
      {
        name: 'กาญจนดิษฐ์',
        subDistricts: [
          { name: 'กะแดะ', zipcode: '84160' },
          { name: 'ท่าทอง', zipcode: '84160' },
          { name: 'ช้างขวา', zipcode: '84160' },
          { name: 'ตะเคียนทอง', zipcode: '84160' },
        ],
      },
      {
        name: 'พุนพิน',
        subDistricts: [
          { name: 'ท่าข้าม', zipcode: '84130' },
          { name: 'หัวเตย', zipcode: '84130' },
          { name: 'น้ำรอบ', zipcode: '84130' },
          { name: 'มะลวน', zipcode: '84130' },
        ],
      },
      {
        name: 'บ้านนาสาร',
        subDistricts: [
          { name: 'นาสาร', zipcode: '84120' },
          { name: 'พรุพี', zipcode: '84270' },
          { name: 'ทุ่งเตา', zipcode: '84120' },
        ],
      },
    ],
  },

  {
    name: 'นครศรีธรรมราช',
    districts: [
      {
        name: 'เมืองนครศรีธรรมราช',
        subDistricts: [
          { name: 'ในเมือง', zipcode: '80000' },
          { name: 'ท่าวัง', zipcode: '80000' },
          { name: 'คลัง', zipcode: '80000' },
          { name: 'นาเคียน', zipcode: '80000' },
        ],
      },
      {
        name: 'ทุ่งสง',
        subDistricts: [
          { name: 'ปากแพรก', zipcode: '80110' },
          { name: 'ชะมาย', zipcode: '80110' },
          { name: 'หนองหงส์', zipcode: '80110' },
          { name: 'ควนกรด', zipcode: '80110' },
        ],
      },
      {
        name: 'ร่อนพิบูลย์',
        subDistricts: [
          { name: 'ร่อนพิบูลย์', zipcode: '80130' },
          { name: 'หินตก', zipcode: '80350' },
          { name: 'เสาธง', zipcode: '80130' },
        ],
      },
      {
        name: 'ฉวาง',
        subDistricts: [
          { name: 'ฉวาง', zipcode: '80150' },
          { name: 'ละอาย', zipcode: '80250' },
          { name: 'นาแว', zipcode: '80150' },
        ],
      },
    ],
  },

  {
    name: 'สงขลา',
    districts: [
      {
        name: 'เมืองสงขลา',
        subDistricts: [
          { name: 'บ่อยาง', zipcode: '90000' },
          { name: 'เขารูปช้าง', zipcode: '90000' },
          { name: 'เกาะแต้ว', zipcode: '90000' },
          { name: 'พะวง', zipcode: '90100' },
        ],
      },
      {
        name: 'หาดใหญ่',
        subDistricts: [
          { name: 'หาดใหญ่', zipcode: '90110' },
          { name: 'คอหงส์', zipcode: '90110' },
          { name: 'ควนลัง', zipcode: '90110' },
          { name: 'คลองแห', zipcode: '90110' },
        ],
      },
      {
        name: 'สะเดา',
        subDistricts: [
          { name: 'สะเดา', zipcode: '90120' },
          { name: 'ปริก', zipcode: '90120' },
          { name: 'พังลา', zipcode: '90170' },
        ],
      },
      {
        name: 'รัตภูมิ',
        subDistricts: [
          { name: 'กำแพงเพชร', zipcode: '90180' },
          { name: 'ท่าชะมวง', zipcode: '90180' },
          { name: 'คูหาใต้', zipcode: '90180' },
        ],
      },
    ],
  },

  {
    name: 'ตรัง',
    districts: [
      {
        name: 'เมืองตรัง',
        subDistricts: [
          { name: 'ทับเที่ยง', zipcode: '92000' },
          { name: 'นาตาล่วง', zipcode: '92000' },
          { name: 'บางรัก', zipcode: '92000' },
          { name: 'นาท่ามเหนือ', zipcode: '92190' },
        ],
      },
      {
        name: 'ห้วยยอด',
        subDistricts: [
          { name: 'ห้วยยอด', zipcode: '92130' },
          { name: 'เขาขาว', zipcode: '92130' },
          { name: 'หนองช้างแล่น', zipcode: '92130' },
        ],
      },
      {
        name: 'ย่านตาขาว',
        subDistricts: [
          { name: 'ย่านตาขาว', zipcode: '92140' },
          { name: 'นาชุมเห็ด', zipcode: '92140' },
          { name: 'ในควน', zipcode: '92140' },
        ],
      },
    ],
  },

  {
    name: 'พัทลุง',
    districts: [
      {
        name: 'เมืองพัทลุง',
        subDistricts: [
          { name: 'คูหาสวรรค์', zipcode: '93000' },
          { name: 'เขาเจียก', zipcode: '93000' },
          { name: 'ท่ามิหรำ', zipcode: '93000' },
          { name: 'โคกชะงาย', zipcode: '93000' },
        ],
      },
      {
        name: 'ควนขนุน',
        subDistricts: [
          { name: 'ควนขนุน', zipcode: '93110' },
          { name: 'พนางตุง', zipcode: '93150' },
          { name: 'มะกอกเหนือ', zipcode: '93110' },
        ],
      },
      {
        name: 'ตะโหมด',
        subDistricts: [
          { name: 'แม่ขรี', zipcode: '93160' },
          { name: 'ตะโหมด', zipcode: '93160' },
          { name: 'คลองใหญ่', zipcode: '93160' },
        ],
      },
    ],
  },

  {
    name: 'ระนอง',
    districts: [
      {
        name: 'เมืองระนอง',
        subDistricts: [
          { name: 'เขานิเวศน์', zipcode: '85000' },
          { name: 'ราชกรูด', zipcode: '85000' },
          { name: 'หงาว', zipcode: '85000' },
          { name: 'บางริ้น', zipcode: '85000' },
        ],
      },
      {
        name: 'กระบุรี',
        subDistricts: [
          { name: 'น้ำจืด', zipcode: '85110' },
          { name: 'ปากจั่น', zipcode: '85110' },
          { name: 'มะมุ', zipcode: '85110' },
        ],
      },
      {
        name: 'ละอุ่น',
        subDistricts: [
          { name: 'ละอุ่นใต้', zipcode: '85130' },
          { name: 'ละอุ่นเหนือ', zipcode: '85130' },
          { name: 'บางพระใต้', zipcode: '85130' },
        ],
      },
    ],
  },

  {
    name: 'กระบี่',
    districts: [
      {
        name: 'เมืองกระบี่',
        subDistricts: [
          { name: 'ปากน้ำ', zipcode: '81000' },
          { name: 'กระบี่ใหญ่', zipcode: '81000' },
          { name: 'อ่าวนาง', zipcode: '81180' },
          { name: 'หนองทะเล', zipcode: '81180' },
        ],
      },
      {
        name: 'อ่าวลึก',
        subDistricts: [
          { name: 'อ่าวลึกใต้', zipcode: '81110' },
          { name: 'แหลมสัก', zipcode: '81110' },
          { name: 'นาเหนือ', zipcode: '81110' },
        ],
      },
      {
        name: 'คลองท่อม',
        subDistricts: [
          { name: 'คลองท่อมใต้', zipcode: '81120' },
          { name: 'คลองท่อมเหนือ', zipcode: '81120' },
          { name: 'ทรายขาว', zipcode: '81170' },
        ],
      },
    ],
  },

  {
    name: 'ชุมพร',
    districts: [
      {
        name: 'เมืองชุมพร',
        subDistricts: [
          { name: 'ท่าตะเภา', zipcode: '86000' },
          { name: 'ปากน้ำ', zipcode: '86120' },
          { name: 'ท่ายาง', zipcode: '86000' },
          { name: 'นาทุ่ง', zipcode: '86000' },
        ],
      },
      {
        name: 'หลังสวน',
        subDistricts: [
          { name: 'หลังสวน', zipcode: '86110' },
          { name: 'ขันเงิน', zipcode: '86110' },
          { name: 'ท่ามะพลา', zipcode: '86110' },
        ],
      },
      {
        name: 'สวี',
        subDistricts: [
          { name: 'นาโพธิ์', zipcode: '86130' },
          { name: 'สวี', zipcode: '86130' },
          { name: 'ทุ่งระยะ', zipcode: '86130' },
        ],
      },
    ],
  },

  {
    name: 'ยะลา',
    districts: [
      {
        name: 'เมืองยะลา',
        subDistricts: [
          { name: 'สะเตง', zipcode: '95000' },
          { name: 'บุดี', zipcode: '95000' },
          { name: 'ยุโป', zipcode: '95000' },
          { name: 'ลำใหม่', zipcode: '95160' },
        ],
      },
      {
        name: 'เบตง',
        subDistricts: [
          { name: 'เบตง', zipcode: '95110' },
          { name: 'ยะรม', zipcode: '95110' },
          { name: 'ตาเนาะแมเราะ', zipcode: '95110' },
        ],
      },
      {
        name: 'ยะหา',
        subDistricts: [
          { name: 'ยะหา', zipcode: '95120' },
          { name: 'บาโร๊ะ', zipcode: '95120' },
          { name: 'ละแอ', zipcode: '95120' },
        ],
      },
    ],
  },
];

export const PROVINCE_NAMES = THAI_ADDRESS.map((p) => p.name);

export function getDistricts(provinceName: string): District[] {
  return THAI_ADDRESS.find((p) => p.name === provinceName)?.districts ?? [];
}

export function getSubDistricts(
  provinceName: string,
  districtName: string,
): SubDistrict[] {
  return getDistricts(provinceName).find((d) => d.name === districtName)?.subDistricts ?? [];
}

export function lookupZipcode(
  provinceName: string,
  districtName: string,
  subDistrictName: string,
): string | undefined {
  return getSubDistricts(provinceName, districtName)
    .find((s) => s.name === subDistrictName)?.zipcode;
}
