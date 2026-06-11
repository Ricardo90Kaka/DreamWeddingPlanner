"use client";

import { useEffect, useRef } from "react";

type AutoGrowTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function AutoGrowTextarea({
  onInput,
  ...props
}: AutoGrowTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function resizeTextarea() {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "0px";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  useEffect(() => {
    resizeTextarea();
  }, [props.defaultValue, props.value]);

  return (
    <textarea
      {...props}
      ref={textareaRef}
      onInput={(event) => {
        resizeTextarea();
        onInput?.(event);
      }}
    />
  );
}
