import { Upload } from "antd"

import {
  ACCEPTED_EXTS,
  ACCEPTED_MIME,
  MAX_FILE_BYTES,
} from "@/features/auth/constants/register-shared"

export type ZodIssue = { path: (string | number)[]; message: string }

export type StepSchemaType = {
  safeParse: (
    data: unknown,
  ) => { success: true } | { success: false; error: { issues: ZodIssue[] } }
}

export function beforeUpload(file: File) {
  const isValidType =
    ACCEPTED_MIME.includes(file.type) ||
    ACCEPTED_EXTS.split(",").some((ext) =>
      file.name.toLowerCase().endsWith(ext),
    )
  const isValidSize = file.size <= MAX_FILE_BYTES
  return isValidType && isValidSize ? false : Upload.LIST_IGNORE
}
