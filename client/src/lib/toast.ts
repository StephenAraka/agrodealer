import toast from "react-hot-toast";

export const appToast = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
};
