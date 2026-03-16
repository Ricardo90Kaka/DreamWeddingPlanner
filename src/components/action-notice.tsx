type ActionNoticeProps = {
  message?: string;
};

export function ActionNotice({ message }: ActionNoticeProps) {
  if (!message) {
    return null;
  }

  return (
    <div className="mb-4 rounded-[1.4rem] border border-[#cf9b8f] bg-[#fff1ec] px-4 py-3 text-sm font-medium text-[#8d4034] shadow-[0_8px_20px_rgba(141,64,52,0.1)]">
      {message}
    </div>
  );
}
