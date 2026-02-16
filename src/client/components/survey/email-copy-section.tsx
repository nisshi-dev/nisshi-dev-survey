import { Checkbox, Input, Label, TextField } from "@heroui/react";
import { AnimatePresence, motion } from "motion/react";

interface Props {
  sendCopy: boolean;
  onSendCopyChange: (value: boolean) => void;
}

export function EmailCopySection({ sendCopy, onSendCopyChange }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <Checkbox isSelected={sendCopy} onChange={onSendCopyChange}>
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        回答のコピーをメールで受け取る
      </Checkbox>

      <AnimatePresence initial={false}>
        {sendCopy && (
          <motion.div
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            initial={{ opacity: 0, height: 0 }}
            key="email-input"
            style={{ overflow: "hidden" }}
            transition={{ duration: 0.2 }}
          >
            <TextField isRequired name="respondentEmail" type="email">
              <Label>メールアドレス</Label>
              <Input placeholder="example@mail.com" />
            </TextField>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
