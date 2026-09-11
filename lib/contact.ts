export type ContactFormValues = {
  fullName: string;
  phone: string;
  email: string;
  productInterest: string;
  message: string;
};

export type ContactFormErrors = Partial<Record<keyof ContactFormValues, string>>;

export type ContactApiResponse =
  | {
      success: true;
      message: string;
      inquiryId: number;
    }
  | {
      success: false;
      message: string;
      errors?: ContactFormErrors;
    };

export function normalizeContactForm(values: ContactFormValues): ContactFormValues {
  return {
    fullName: values.fullName.trim(),
    phone: values.phone.trim(),
    email: values.email.trim().toLowerCase(),
    productInterest: values.productInterest.trim(),
    message: values.message.trim(),
  };
}

export function validateContactForm(values: ContactFormValues): ContactFormErrors {
  const errors: ContactFormErrors = {};

  if (values.fullName.trim().length < 2) {
    errors.fullName = "Vui lòng nhập họ và tên hợp lệ.";
  }

  const normalizedPhone = values.phone.replace(/[^\d+]/g, "");
  if (normalizedPhone.length < 8 || normalizedPhone.length > 15) {
    errors.phone = "Vui lòng nhập số điện thoại hợp lệ.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(values.email.trim())) {
    errors.email = "Vui lòng nhập địa chỉ email hợp lệ.";
  }

  if (values.productInterest.trim().length > 120) {
    errors.productInterest = "Tên sản phẩm quan tâm không nên vượt quá 120 ký tự.";
  }

  if (values.message.trim().length < 10) {
    errors.message = "Vui lòng mô tả nhu cầu chi tiết hơn.";
  }

  return errors;
}
