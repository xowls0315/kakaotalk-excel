export default function GuidePage() {
  return (
    <div className="container mx-auto max-w-4xl py-12">
      <h1 className="mb-8 text-center text-4xl font-bold text-gray-900">
        카카오톡 대화 내보내기 방법
      </h1>

      <div className="space-y-8">
        <section className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">
            1. 카카오톡 앱 열기
          </h2>
          <p className="text-gray-700">
            변환하고 싶은 대화방을 엽니다.
          </p>
        </section>

        <section className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">
            2. 대화 내보내기
          </h2>
          <ol className="list-decimal space-y-2 pl-6 text-gray-700">
            <li>대화방 상단의 메뉴(⋮)를 클릭합니다</li>
            <li>"대화 내보내기"를 선택합니다</li>
            <li>내보낼 항목을 선택합니다 (텍스트만 선택 가능)</li>
            <li>저장 위치를 선택하고 저장합니다</li>
          </ol>
        </section>

        <section className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">
            3. 파일 업로드
          </h2>
          <p className="text-gray-700">
            저장된 .txt 파일을 이 사이트에 업로드하면 엑셀로 변환됩니다.
          </p>
        </section>

        <section className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">
            💡 팁
          </h2>
          <ul className="list-disc space-y-2 pl-6 text-gray-700">
            <li>대용량 대화는 시간이 걸릴 수 있습니다</li>
            <li>파일 크기는 최대 10MB까지 지원합니다</li>
            <li>로그인하면 변환 기록을 저장할 수 있습니다</li>
          </ul>
        </section>
      </div>

      <div className="mt-8 text-center">
        <a
          href="/upload"
          className="inline-block rounded-xl bg-sky-500 px-8 py-3 font-semibold text-white hover:bg-sky-600"
        >
          파일 업로드하기
        </a>
      </div>
    </div>
  );
}

