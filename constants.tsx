import React from 'react';

import type { NavItem } from './types';
import { KullaniciRol } from './types';

// Icons from Heroicons: https://heroicons.com/ (Outline, 24x24, stroke-width: 1.5)
export const ICONS = {
  // Navigation Icons (24x24 outline)
  DASHBOARD: (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z'
      />
    </svg>
  ),
  PEOPLE: (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-2.308l.143-.143-1.05-1.05a2.25 2.25 0 0 1-1.586-.858c-.035-.052-.072-.105-.108-.158l-1.3-1.3a2.25 2.25 0 0 0-3.182 0l-1.3 1.3a2.25 2.25 0 0 1-1.585.858l-1.05 1.05a9.337 9.337 0 0 0 4.121 2.308M15 19.128v-2.828l-1.3-1.3a2.25 2.25 0 0 0-3.182 0l-1.3 1.3a2.25 2.25 0 0 1-1.585.858l-1.05 1.05a9.337 9.337 0 0 0 4.121 2.308M12 6.75a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 0 1 0-4.5Zm0 0a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Zm-4.5 0a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 0 1 0-4.5Zm0 0a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Zm9 0a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 0 1 0-4.5Zm0 0a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z'
      />
    </svg>
  ),
  AID_RECIPIENT: (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M12 20.25c.966 0 1.891-.418 2.57-1.126a9.75 9.75 0 0 1 4.293-3.692c.308-.146.634-.26.974-.359a1.125 1.125 0 0 1 .868 1.125v.75a1.125 1.125 0 0 1-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125v-.75a1.125 1.125 0 0 1 .868-1.125c.34-.1.666-.213.974-.359a9.75 9.75 0 0 1 4.293-3.692c.679-.708 1.604-1.126 2.57-1.126m-15.75 0c.966 0 1.891-.418 2.57-1.126a9.75 9.75 0 0 1 4.293-3.692c.308-.146.634-.26.974-.359a1.125 1.125 0 0 1 .868 1.125v.75a1.125 1.125 0 0 1-1.125 1.125h-9.75A1.125 1.125 0 0 1 3 16.5v-.75a1.125 1.125 0 0 1 .868-1.125c.34-.1.666-.213.974-.359a9.75 9.75 0 0 1 4.293-3.692c.679-.708 1.604-1.126 2.57-1.126m4.5 0c.966 0 1.891-.418 2.57-1.126a9.75 9.75 0 0 1 4.293-3.692c.308-.146.634-.26.974-.359a1.125 1.125 0 0 1 .868 1.125v.75a1.125 1.125 0 0 1-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125v-.75a1.125 1.125 0 0 1 .868-1.125c.34-.1.666-.213.974-.359a9.75 9.75 0 0 1 4.293-3.692c.679-.708 1.604-1.126 2.57-1.126M4.5 9.75a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm15 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-7.5 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'
      />
    </svg>
  ),
  SCHOLARSHIP: (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5'
      />
    </svg>
  ),
  KUMBARA: (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6V5.25m0 0a3 3 0 0 1 3-3h1.5a3 3 0 0 1 3 3V5.25m0 0v.75a.75.75 0 0 1-.75-.75V5.25m6-1.5V5.25a.75.75 0 0 0-.75-.75h-1.5a3 3 0 0 0-3 3V5.25m0 0v.75a.75.75 0 0 0 .75-.75V5.25m6 3.75a.75.75 0 0 1-.75-.75V5.25m0 0a3 3 0 0 1 3-3h1.5a3 3 0 0 1 3 3V5.25m0 0v.75a.75.75 0 0 1-.75-.75V5.25M9 9.75a3 3 0 0 1-3 3H3.75a3 3 0 0 1-3-3v-1.5a3 3 0 0 1 3-3H6a3 3 0 0 1 3 3v1.5Zm12 0a3 3 0 0 1-3 3h-1.5a3 3 0 0 1-3-3v-1.5a3 3 0 0 1 3-3H18a3 3 0 0 1 3 3v1.5Z'
      />
    </svg>
  ),
  LEGAL: (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52v1.666c0 .414-.162.798-.448 1.084a8.97 8.97 0 0 1-11.104 0c-.286-.286-.448-.67-.448-1.084V5.49a48.507 48.507 0 0 1 3-.52M3.75 5.49v1.666c0 .414.162.798.448 1.084 1.186 1.186 3.041 1.886 4.802 1.886s3.616-.7 4.802-1.886c.286-.286-.448-.67-.448-1.084V5.49M9 9.75h6m-6 3.75h6m-6 3.75h6'
      />
    </svg>
  ),
  CALENDAR: (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18M12 11.25h.008v.008H12v-.008Zm0 3.75h.008v.008H12v-.008Zm3.75-3.75h.008v.008h-.008v-.008Zm0 3.75h.008v.008h-.008v-.008Zm-7.5 0h.008v.008H8.25v-.008Zm3.75 0h.008v.008H12v-.008ZM8.25-3.75h.008v.008H8.25v-.008ZM15.75 7.5h.008v.008h-.008V7.5Z'
      />
    </svg>
  ),
  CLIPBOARD_DOCUMENT_LIST: (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth='1.5'
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 5.25 6h.008a2.25 2.25 0 0 1 2.242 2.15 48.062 48.062 0 0 1-.61 4.135A2.25 2.25 0 0 1 5.25 15h-.008a2.25 2.25 0 0 1-2.242-2.15A48.06 48.06 0 0 1 3 8.847V6.108c0-1.135.845-2.098 1.976-2.192a48.424 48.424 0 0 1 1.123-.08'
      />
    </svg>
  ),
  FINANCE: (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z'
      />
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z'
      />
    </svg>
  ),
  SETTINGS: (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M10.343 3.94c.09-.542.56-1.007 1.11-1.226l.28-.1c.34-.125.702-.125 1.043 0l.28.1c.548.219 1.02.684 1.11 1.226l.094.542c.063.372.24.717.493 1.002l.423.493c.335.39.802.593 1.28.593h.542c.563 0 1.08.317 1.35.82l.248.455c.294.542.294 1.205 0 1.747l-.248.455a1.5 1.5 0 0 1-1.35.82h-.542c-.478 0-.945.203-1.28.593l-.423.493a1.487 1.487 0 0 0-.494 1.002l-.094.542c-.09.542-.56 1.007-1.11 1.226l-.28.1c-.34.125-.702-.125-1.043 0l-.28-.1c-.548-.219-1.02-.684-1.11-1.226l-.094-.542a1.487 1.487 0 0 0-.494-1.002l-.423-.493c-.335-.39-.802.593-1.28.593h-.542c-.563 0-1.08-.317-1.35-.82l-.248.455c-.294.542-.294 1.205 0-1.747l.248.455a1.5 1.5 0 0 1 1.35.82h.542c.478 0 .945.203 1.28.593l.423.493c.253-.285.43-.63.493-1.002l.094-.542Z'
      />
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'
      />
    </svg>
  ),
  DONATION: (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z'
      />
    </svg>
  ),
  MESSAGE: (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.724.466c-.54.067-1.067.368-1.423.788l-2.074 2.333a.75.75 0 0 1-1.154 0l-2.074-2.333a2.25 2.25 0 0 0-1.423-.788l-3.724-.466A2.25 2.25 0 0 1 3 14.894V10.608c0-.97.616-1.813 1.5-2.097L8.25 6.75l.41-.164a.75.75 0 0 1 .832.832l-.41.164-3 1.2a.75.75 0 0 0-.416.663l.008 4.286c.004.414.342.746.75.746h.046l3.724-.466a.75.75 0 0 1 .473.263l2.074 2.333 2.074-2.333a.75.75 0 0 1 .473-.263l3.724.466h.046a.75.75 0 0 0 .75-.746l.008-4.286a.75.75 0 0 0-.416-.663l-3-1.2-.41-.164a.75.75 0 0 1 .832-.832l.41.164 3 1.2Z'
      />
    </svg>
  ),
  WAREHOUSE: (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5'
      />
    </svg>
  ),
  VOLUNTEER: (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.14 2.72a3 3 0 0 1-4.682-2.72 9.094 9.094 0 0 1 3.741-.479m7.14 2.72a8.966 8.966 0 0 1-7.14 0m7.14 0a3 3 0 1 0-4.682 2.72M3 18.72v-2.172c0-.969.785-1.75 1.75-1.75h14.5c.965 0 1.75.781 1.75 1.75v2.172M4.5 12.75a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008a.75.75 0 0 1 .75-.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm13.5.75a.75.75 0 0 0-.75-.75h-.008a.75.75 0 0 0-.75.75v.008a.75.75 0 0 0 .75.75h.008a.75.75 0 0 0 .75-.75v-.008Zm-.375 0a.375.375 0 1 0 .75 0 .375.375 0 0 0-.75 0Z'
      />
    </svg>
  ),
  HEART_HAND: (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z'
      />
    </svg>
  ),
  SHIELD_CHECK: (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'
      />
    </svg>
  ),
  ARCHIVE_BOX: (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z'
      />
    </svg>
  ),
  ORPHAN: (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z'
      />
    </svg>
  ),
  HELP: (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z'
      />
    </svg>
  ),
  TICKET: (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z'
      />
    </svg>
  ),
  LIGHTBULB: (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.311a7.5 7.5 0 0 1-7.5 0c-1.42 0-2.798-.31-4.007-1.026A3 3 0 0 1 3 13.5v-1.125c0-1.68.768-3.18 1.95-4.195C6.42 6.648 8.108 6 10.5 6h3c2.392 0 4.08.648 5.55 2.18C20.232 9.18 21 10.68 21 12.375v1.125a3 3 0 0 1-1.993 2.849 11.957 11.957 0 0 1-4.007 1.026Z'
      />
    </svg>
  ),
  REPORT: (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z'
      />
    </svg>
  ),
  MAP: (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252c-.317-.159-.69-.159-1.006 0L4.628 5.186c-.748.374-1.228 1.17-1.228 1.994v10.198c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159-1.006 0l4.875 2.437c.381.19.622-.58.622-1.006V4.82a1.875 1.875 0 0 0-1.628-1.006Z'
      />
    </svg>
  ),

  // UI Icons (20x20 or 24x24 outline)
  CHEVRON_DOWN: (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='20'
      height='20'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='m19.5 8.25-7.5 7.5-7.5-7.5'
      />
    </svg>
  ),
  SUN: (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='20'
      height='20'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z'
      />
    </svg>
  ),
  MOON: (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='20'
      height='20'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z'
      />
    </svg>
  ),
  BELL: (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0'
      />
    </svg>
  ),
  LOGOUT: (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9'
      />
    </svg>
  ),
  X_MARK: (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M6 18 18 6M6 6l12 12'
      />
    </svg>
  ),
  HAMBURGER: (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5'
      />
    </svg>
  ),
  UPLOAD: (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5'
      />
    </svg>
  ),
  INTEGRATION: (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244'
      />
    </svg>
  )
};

const { YONETICI, EDITOR, MUHASEBE, GONULLU } = KullaniciRol;

export const NAVIGATION_ITEMS: NavItem[] = [
  { path: '/', name: 'Dashboard / Ana Sayfa', icon: ICONS.DASHBOARD },
  {
    path: '/bagis-yonetimi',
    name: 'Bağış Yönetimi',
    icon: ICONS.DONATION,
    roles: [YONETICI, MUHASEBE],
    subItems: [
      { path: '/bagis-yonetimi/tum-bagislar', name: 'Tüm Bağışlar' },
      { path: '/bagis-yonetimi/nakit', name: 'Nakit Bağışlar' },
      { path: '/bagis-yonetimi/ayni', name: 'Ayni Bağışlar' },
      { path: '/kumbaralar', name: 'Kumbara Takibi' }
    ]
  },
  {
    path: '/kisiler',
    name: 'Kişiler & Kurumlar',
    icon: ICONS.PEOPLE,
    roles: [YONETICI, EDITOR],
    subItems: [
      { path: '/kisiler', name: 'Kişi Listesi' },
      {
        path: '/gonulluler',
        name: 'Gönüllü Yönetimi',
        roles: [YONETICI, EDITOR, GONULLU]
      },
      { path: '/kurumlar', name: 'Kurumlar' }
    ]
  },
  {
    path: '/yardim-yonetimi',
    name: 'Yardım Yönetimi',
    icon: ICONS.AID_RECIPIENT,
    roles: [YONETICI, EDITOR],
    subItems: [
      { path: '/ihtiyac-sahipleri', name: 'Yardım Alanlar' },
      { path: '/yardimlar', name: 'Yardım Başvuruları' },
      {
        path: '/yardim-yonetimi/nakdi-yardimlar',
        name: 'Nakdi Yardım İşlemleri'
      },
      {
        path: '/yardim-yonetimi/ayni-yardimlar',
        name: 'Ayni Yardım İşlemleri'
      },
      { path: '/yardim-yonetimi/tum-yardimlar', name: 'Tüm Yardım İşlemleri' },
      { path: '/depo-yonetimi', name: 'Depo & Stok Yönetimi' },
      {
        path: '/vefa-destek',
        name: 'Vefa Destek Yönetimi',
        icon: ICONS.HEART_HAND
      },
      { path: '/odemeler', name: 'Banka Ödeme Emirleri' },
      { path: '/yardim-yonetimi/hizmet-takip', name: 'Hizmet Takip İşlemleri' },
      { path: '/yardim-yonetimi/hastane-sevk', name: 'Hastane Sevk İşlemleri' },
      { path: '/baskan-onayi', name: 'Onay Süreci', roles: [YONETICI] }
    ]
  },
  {
    path: '/harita',
    name: 'Harita Modülü',
    icon: ICONS.MAP,
    roles: [YONETICI, EDITOR]
  },
  {
    path: '/dokuman-arsivi',
    name: 'Doküman Arşivi',
    icon: ICONS.ARCHIVE_BOX,
    roles: [YONETICI, EDITOR]
  },
  {
    path: '/uyeler',
    name: 'Üye Yönetimi',
    icon: ICONS.PEOPLE,
    roles: [YONETICI, EDITOR]
  },
  {
    path: '/takvim',
    name: 'Takvim',
    icon: ICONS.CALENDAR,
    roles: [YONETICI, EDITOR, GONULLU]
  },
  {
    path: '/finansal-kayitlar',
    name: 'Finans & Fon Yönetimi',
    icon: ICONS.FINANCE,
    roles: [YONETICI, MUHASEBE]
  },
  {
    path: '/mesajlasma',
    name: 'Mesajlaşma',
    icon: ICONS.MESSAGE,
    roles: [YONETICI, EDITOR],
    subItems: [
      { path: '/toplu-iletisim', name: 'SMS/E-Posta Gönder' },
      { path: '/mesajlasma/raporlar', name: 'Mesaj Raporları' }
    ]
  },
  {
    path: '/projeler',
    name: 'Proje Yönetimi',
    icon: ICONS.CLIPBOARD_DOCUMENT_LIST,
    roles: [YONETICI, EDITOR, GONULLU]
  },
  {
    path: '/raporlama-analitik',
    name: 'Raporlama & Analitik',
    icon: ICONS.REPORT,
    roles: [YONETICI]
  },
  {
    path: '/etkinlikler',
    name: 'Etkinlik Yönetimi',
    icon: ICONS.TICKET,
    roles: [YONETICI, EDITOR, GONULLU]
  },
  {
    path: '/burslar',
    name: 'Burs Yönetimi',
    icon: ICONS.SCHOLARSHIP,
    roles: [YONETICI, EDITOR]
  },
  {
    path: '/yetimler',
    name: 'Yetim Yönetimi',
    icon: ICONS.ORPHAN,
    roles: [YONETICI, EDITOR]
  },
  {
    path: '/hukuki-yardim',
    name: 'Hukuk Yönetimi',
    icon: ICONS.LEGAL,
    roles: [YONETICI]
  },
  { path: '/destek', name: 'Yardım & Destek', icon: ICONS.HELP },
  {
    path: '/toplu-veri-yukleme',
    name: 'Toplu Veri Yükleme',
    icon: ICONS.UPLOAD,
    roles: [YONETICI, EDITOR]
  },
  {
    path: '/entegrasyonlar',
    name: 'Entegrasyonlar',
    icon: ICONS.INTEGRATION,
    roles: [YONETICI],
    subItems: [
      { path: '/entegrasyonlar/ayarlar', name: 'Entegrasyon Ayarları' },
      { path: '/entegrasyonlar/muhasebe', name: 'Muhasebe Entegrasyonu' },
      { path: '/entegrasyonlar/otomatik-bagis-takibi', name: 'Otomatik Bağış Takibi' },
      { path: '/entegrasyonlar/e-devlet', name: 'E-Devlet Entegrasyonu' },
      { path: '/entegrasyonlar/whatsapp', name: 'WhatsApp Entegrasyonu' }
    ]
  },
  {
    path: '/ayarlar',
    name: 'Parametreler & Tanımlar',
    icon: ICONS.SETTINGS,
    roles: [YONETICI],
    subItems: [
      { path: '/kullanicilar', name: 'Kullanıcı Yönetimi' },
      { path: '/denetim-kayitlari', name: 'Denetim Kayıtları' },
      { path: '/ayarlar/genel', name: 'Genel Ayarlar' },
      { path: '/ayarlar/api-entegrasyonlari', name: 'API & Entegrasyonlar' }
    ]
  }
];
