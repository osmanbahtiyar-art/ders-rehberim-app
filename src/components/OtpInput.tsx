import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface OtpInputProps {
  value: string;
  onChange: (val: string) => void;
  length?: number;
}

const OtpInput = ({ value, onChange, length = 6 }: OtpInputProps) => (
  <InputOTP maxLength={length} value={value} onChange={onChange}>
    <InputOTPGroup className="gap-2">
      {Array.from({ length }).map((_, i) => (
        <InputOTPSlot key={i} index={i} className="h-12 w-12 text-lg rounded-xl border-border" />
      ))}
    </InputOTPGroup>
  </InputOTP>
);

export default OtpInput;
