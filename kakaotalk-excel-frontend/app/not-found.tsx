import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="mb-6 text-6xl">🔍</div>
      <h1 className="mb-4 text-4xl font-bold text-[#2F2F2F]">
        페이지를 찾을 수 없어요
      </h1>
      <p className="mb-8 text-lg text-gray-600">
        요청하신 페이지가 존재하지 않거나
        <br />
        이동되었을 수 있어요.
      </p>
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
        <Link
          href="/"
          className="
            rounded-lg
            bg-[#FBE27A]
            px-6 py-3
            text-base
            font-semibold
            text-[#2F2F2F]
            transition
            hover:bg-[#F5D96B]
          "
        >
          홈으로 돌아가기
        </Link>
        <Link
          href="/upload"
          className="
            rounded-lg
            border border-[#3FAF8E]
            bg-white
            px-6 py-3
            text-base
            font-medium
            text-[#2F2F2F]
            transition
            hover:bg-[#EAF7F2]
          "
        >
          파일 업로드하기
        </Link>
      </div>
    </div>
  );
}




