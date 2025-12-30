export default function GuidePage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      {/* Title */}
      <h1 className="mb-4 text-center text-4xl font-bold text-[#2F2F2F]">
        카카오톡 대화,
        <br />
        이렇게 내보내면 돼요 🙂
      </h1>
      <p className="mb-12 text-center text-gray-600">
        처음이어도 걱정하지 마세요.
        <br />
        차근차근 따라오면 금방 끝나요!
      </p>

      <div className="space-y-8">
        {/* Step 1 */}
        <section className="rounded-2xl border border-dashed border-[#FBE27A] bg-white p-6">
          <div className="mb-3 flex items-center gap-3">
            <span className="rounded-lg bg-[#FFF3C4] px-3 py-1 text-sm font-semibold text-[#2F2F2F]">
              STEP 1
            </span>
            <h2 className="text-xl font-semibold text-[#2F2F2F]">
              카카오톡 앱을 열어주세요
            </h2>
          </div>
          <p className="text-gray-700">
            엑셀로 정리하고 싶은 대화방으로 들어가면 돼요.
          </p>
        </section>

        {/* Step 2 */}
        <section className="rounded-2xl border border-dashed border-[#FBE27A] bg-white p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded-lg bg-[#FFF3C4] px-3 py-1 text-sm font-semibold text-[#2F2F2F]">
              STEP 2
            </span>
            <h2 className="text-xl font-semibold text-[#2F2F2F]">
              대화를 파일로 내보내기
            </h2>
          </div>
          <ol className="list-decimal space-y-2 pl-6 text-gray-700">
            <li>대화방 오른쪽 위에 있는 메뉴(⋮)를 눌러요</li>
            <li>“대화 내보내기”를 선택해요</li>
            <li>
              내보낼 항목에서는 <strong>텍스트만</strong> 체크해주세요
            </li>
            <li>저장 위치를 정하고 저장하면 끝이에요</li>
          </ol>
        </section>

        {/* Step 3 */}
        <section className="rounded-2xl border border-dashed border-[#FBE27A] bg-white p-6">
          <div className="mb-3 flex items-center gap-3">
            <span className="rounded-lg bg-[#FFF3C4] px-3 py-1 text-sm font-semibold text-[#2F2F2F]">
              STEP 3
            </span>
            <h2 className="text-xl font-semibold text-[#2F2F2F]">
              파일을 여기로 올려주세요
            </h2>
          </div>
          <p className="text-gray-700">
            방금 저장한 <strong>.txt 파일</strong>을 업로드하면
            <br />
            자동으로 엑셀 파일로 바꿔드려요 ✨
          </p>
        </section>

        {/* Tip */}
        <section className="rounded-2xl border border-[#FBE27A] bg-[#FFF8D8] p-6">
          <h2 className="mb-4 text-xl font-semibold text-[#2F2F2F]">
            💡 알아두면 좋아요
          </h2>
          <ul className="list-disc space-y-2 pl-6 text-gray-700">
            <li>대화가 많으면 변환에 조금 시간이 걸릴 수 있어요</li>
            <li>파일 크기는 최대 10MB까지 업로드할 수 있어요</li>
            <li>로그인하면 변환했던 파일을 나중에 다시 받을 수 있어요</li>
          </ul>
        </section>
      </div>

      {/* CTA */}
      <div className="mt-12 text-center">
        <a
          href="/upload"
          className="
            inline-block
            rounded-lg
            bg-[#FBE27A]
            px-8 py-3
            text-lg
            font-semibold
            text-[#2F2F2F]
            transition
            hover:bg-[#F5D96B]
          "
        >
          이제 파일 올리러 가기 →
        </a>
      </div>
    </div>
  );
}
