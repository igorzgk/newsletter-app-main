'use client';

import Image from "next/image";
import { Editor } from "novel";
import NL from '../../../public/Untitled.png';

interface MainTemplateProps {
  onContent: (content: string) => void;
}

export default function MainTemplate({ onContent }: MainTemplateProps) {
  return <div className='bg-gray-100 min-h-screen py-12'>
    <div className="font-sans text-gray-400 w-full container max-w-[700px] mx-auto pb-8 bg-white text-lg">
      <div className="w-full h-auto">
        <Image
          src={NL}
          alt="ST20191530 newsletter"
        />
      </div>
      <div className="mx-6 py-7">
        <Editor
          onUpdate={(e: any) => {
            const html = e.getHTML();
            onContent(html);
          }}
        />
        <hr />
        <footer>
          <p className="py-4">
            Thanks for following<br />👋 See you next time!<br />— ST20191530
          </p>
        </footer>
      </div>
    </div>
  </div>;
}