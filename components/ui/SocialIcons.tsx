import type { SVGProps } from "react";

/** Brand marks not covered by lucide-react, drawn to match its 24px stroke style. */

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <line x1="7.5" y1="10" x2="7.5" y2="17" />
      <circle cx="7.5" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
      <path d="M11.5 17v-4.2c0-1.6 1-2.5 2.3-2.5 1.3 0 2.2.9 2.2 2.5V17" />
      <line x1="11.5" y1="10" x2="11.5" y2="17" />
    </svg>
  );
}

export function BehanceIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 7h5.2a2.4 2.4 0 0 1 0 4.8H3z" />
      <path d="M3 11.8h5.6a2.6 2.6 0 0 1 0 5.2H3z" />
      <path d="M14 13.5a3.4 3.4 0 1 0 6.6-1.1H14a3.3 3.3 0 0 0 3.3 4.4c1.2 0 2-.4 2.7-1.2" />
      <line x1="15" y1="8.2" x2="19.6" y2="8.2" />
    </svg>
  );
}

export function WhatsappIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6.4 17.6 4 20l2.5-2.3A8 8 0 1 1 12 20a8 8 0 0 1-5.6-2.4Z" />
      <path d="M9 9.4c0 3 2.6 5.6 5.6 5.6.5 0 .9-.5.7-1l-.6-1.4a.8.8 0 0 0-.9-.4l-.9.3a4 4 0 0 1-2.4-2.4l.3-.9a.8.8 0 0 0-.4-.9L9.4 7.7c-.5-.2-1 .2-1 .7Z" />
    </svg>
  );
}
