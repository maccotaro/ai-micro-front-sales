import Head from 'next/head'
import Link from 'next/link'

export default function TermsPage() {
  return (
    <>
      <Head>
        <title>利用規約 - Sales AI</title>
      </Head>

      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8">
          <div className="mb-6">
            <a
              href="/signup"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              &larr; 戻る
            </a>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">利用規約</h1>

          <div className="prose prose-sm max-w-none text-gray-600 space-y-6">
            <p className="text-sm text-gray-400">最終更新日: 2026年3月18日</p>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第1条（適用）</h2>
              <p>
                本利用規約（以下「本規約」といいます。）は、エレクス株式会社（以下「当社」といいます。）が提供する
                AI Search Platform（以下「本サービス」といいます。）の利用条件を定めるものです。
                登録ユーザーの皆さま（以下「ユーザー」といいます。）には、本規約に従って本サービスをご利用いただきます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第2条（定義）</h2>
              <p>本規約において使用する用語の定義は以下のとおりとします。</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>「本サービス」とは、当社が提供するSaaS型AIプラットフォームサービス（ドキュメント管理、AI検索、営業支援等の機能を含む）をいいます。</li>
                <li>「ユーザー」とは、本規約に同意の上、当社所定の手続きにより本サービスの利用登録を完了した個人または法人をいいます。</li>
                <li>「テナント」とは、本サービスにおいてユーザーが所属する組織単位をいいます。</li>
                <li>「コンテンツ」とは、ユーザーが本サービスにアップロード、入力、送信したデータ、ドキュメント、テキスト等の情報をいいます。</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第3条（利用登録）</h2>
              <ol className="list-decimal pl-6 mt-2 space-y-2">
                <li>本サービスの利用を希望する者は、本規約に同意の上、当社所定の方法により利用登録を申請するものとします。</li>
                <li>当社は、利用登録の申請者に以下の事由があると判断した場合、利用登録の申請を承認しないことがあります。
                  <ul className="list-disc pl-6 mt-1 space-y-1">
                    <li>虚偽の事項を届け出た場合</li>
                    <li>本規約に違反したことがある者からの申請である場合</li>
                    <li>反社会的勢力等に該当すると当社が判断した場合</li>
                    <li>その他、当社が利用登録を相当でないと判断した場合</li>
                  </ul>
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第4条（アカウント管理）</h2>
              <ol className="list-decimal pl-6 mt-2 space-y-2">
                <li>ユーザーは、自己の責任において、本サービスのアカウント情報（メールアドレスおよびパスワード）を適切に管理するものとします。</li>
                <li>ユーザーは、いかなる場合にも、アカウント情報を第三者に譲渡もしくは貸与し、または第三者と共用することはできません。</li>
                <li>アカウント情報の管理不十分、使用上の過誤、第三者の使用等によって生じた損害に関する責任はユーザーが負うものとし、当社は一切の責任を負いません。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第5条（サービス内容）</h2>
              <p>本サービスは、以下の機能を含むSaaS型AIプラットフォームです。</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>ドキュメントのアップロード、管理、OCR処理</li>
                <li>ナレッジベースの構築および管理</li>
                <li>AI搭載の検索・質問応答機能（RAG検索）</li>
                <li>営業支援機能（議事録管理、提案書生成、シミュレーション等）</li>
                <li>チャットインターフェースによるAIとの対話</li>
                <li>ユーザー管理およびロールベースアクセス制御</li>
                <li>その他、当社が随時追加する機能</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第6条（料金および支払い）</h2>
              <ol className="list-decimal pl-6 mt-2 space-y-2">
                <li>本サービスの利用料金は、当社が別途定める料金表に従うものとします。</li>
                <li>ユーザーは、当社が指定する支払方法により、利用料金を支払うものとします。</li>
                <li>無料プラン（デモアカウント）には、利用期間および機能の制限があります。デモ期間終了後、有償プランに移行しない場合、データが削除される場合があります。</li>
                <li>ユーザーが利用料金の支払いを遅滞した場合、年14.6%の割合による遅延損害金を支払うものとします。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第7条（禁止事項）</h2>
              <p>ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>法令または公序良俗に違反する行為</li>
                <li>犯罪行為に関連する行為</li>
                <li>当社、本サービスの他のユーザー、または第三者のサーバーもしくはネットワークの機能を破壊または妨害する行為</li>
                <li>当社のサービス運営を妨害するおそれのある行為</li>
                <li>他のユーザーに関する個人情報等を不正に収集または蓄積する行為</li>
                <li>不正アクセスをし、またはこれを試みる行為</li>
                <li>他のユーザーに成りすます行為</li>
                <li>本サービスのリバースエンジニアリング、逆コンパイル、逆アセンブル等の行為</li>
                <li>本サービスを利用して、違法、有害、脅迫的、虐待的、嫌がらせ的、不法行為的、中傷的、名誉毀損的な情報を生成・配布する行為</li>
                <li>AIモデルの出力を人間が作成したものとして虚偽の表示をする行為</li>
                <li>当社のサービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為</li>
                <li>その他、当社が不適切と判断する行為</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第8条（知的財産権）</h2>
              <ol className="list-decimal pl-6 mt-2 space-y-2">
                <li>本サービスに関する知的財産権（ソフトウェア、UI/UXデザイン、AIモデル等を含む）は、すべて当社または当社にライセンスを許諾している者に帰属します。</li>
                <li>ユーザーが本サービスにアップロードしたコンテンツの知的財産権は、ユーザーまたは当該コンテンツの権利者に帰属します。</li>
                <li>ユーザーは、当社に対し、本サービスの提供・運営・改善に必要な範囲で、コンテンツを利用する非独占的な権利を許諾するものとします。ただし、当社はユーザーのコンテンツをAIモデルの学習データとして使用しません。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第9条（データの取り扱い）</h2>
              <ol className="list-decimal pl-6 mt-2 space-y-2">
                <li>当社は、ユーザーのコンテンツを、テナントごとに論理的に分離して管理します。</li>
                <li>当社は、適切な技術的・組織的安全管理措置を講じ、ユーザーのコンテンツを保護します。</li>
                <li>ユーザーは、本サービスの利用にあたり、必要なデータのバックアップを自己の責任において行うものとします。</li>
                <li>当社は、法令に基づく場合を除き、ユーザーの同意なくコンテンツを第三者に開示しません。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第10条（AI生成物に関する注意事項）</h2>
              <ol className="list-decimal pl-6 mt-2 space-y-2">
                <li>本サービスのAI機能による生成物（検索結果、要約、提案書等）は、あくまで参考情報であり、その正確性、完全性、最新性を保証するものではありません。</li>
                <li>ユーザーは、AI生成物を利用するにあたり、自己の判断と責任において、その内容を確認・検証するものとします。</li>
                <li>AI生成物に基づいてユーザーが行った判断や行為について、当社は一切の責任を負いません。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第11条（サービスの停止・中断）</h2>
              <p>
                当社は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく、
                本サービスの全部または一部の提供を停止または中断することができるものとします。
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
                <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
                <li>コンピュータまたは通信回線等が事故により停止した場合</li>
                <li>その他、当社が本サービスの提供が困難と判断した場合</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第12条（利用制限および登録抹消）</h2>
              <ol className="list-decimal pl-6 mt-2 space-y-2">
                <li>当社は、ユーザーが本規約のいずれかの条項に違反した場合、事前の通知なく当該ユーザーに対して本サービスの全部もしくは一部の利用を制限し、またはユーザーとしての登録を抹消することができるものとします。</li>
                <li>当社は、ユーザーの登録を抹消した場合、当該ユーザーのコンテンツを削除できるものとします。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第13条（解約）</h2>
              <ol className="list-decimal pl-6 mt-2 space-y-2">
                <li>ユーザーは、当社所定の手続きにより、いつでも本サービスの利用契約を解約することができます。</li>
                <li>解約後、当社は合理的な期間内にユーザーのコンテンツを削除します。ただし、法令上の保存義務がある場合はこの限りではありません。</li>
                <li>解約時点で未払いの利用料金がある場合、ユーザーは直ちに全額を支払うものとします。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第14条（免責事項）</h2>
              <ol className="list-decimal pl-6 mt-2 space-y-2">
                <li>当社は、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティ等に関する欠陥、エラーやバグ、権利侵害等を含みます。）がないことを明示的にも黙示的にも保証しておりません。</li>
                <li>当社は、本サービスに起因してユーザーに生じたあらゆる損害について、当社の故意または重過失による場合を除き、一切の責任を負いません。</li>
                <li>当社がユーザーに対して損害賠償責任を負う場合、その賠償額は、当該損害が発生した月にユーザーが当社に支払った利用料金の額を上限とします。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第15条（規約の変更）</h2>
              <ol className="list-decimal pl-6 mt-2 space-y-2">
                <li>当社は、必要と判断した場合には、ユーザーに通知の上、本規約を変更することができるものとします。</li>
                <li>変更後の規約は、当社が別途定める場合を除き、本サービス上に掲載した時点から効力を生じるものとします。</li>
                <li>本規約の変更後、本サービスの利用を継続した場合には、当該ユーザーは変更後の規約に同意したものとみなします。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第16条（個人情報の取り扱い）</h2>
              <p>
                当社は、本サービスの利用によって取得する個人情報については、当社の
                <a href="/privacy" className="text-blue-600 hover:underline">プライバシーポリシー</a>
                に従い適切に取り扱うものとします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第17条（通知または連絡）</h2>
              <p>
                ユーザーと当社との間の通知または連絡は、当社の定める方法によって行うものとします。
                当社は、ユーザーから当社が別途定める方式に従った変更届出がない限り、
                現在登録されているメールアドレスを連絡先とみなし、当該メールアドレスに対して通知または連絡を行うものとします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第18条（権利義務の譲渡の禁止）</h2>
              <p>
                ユーザーは、当社の書面による事前の承諾なく、利用契約上の地位または本規約に基づく権利もしくは義務を
                第三者に譲渡し、または担保に供することはできません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第19条（準拠法・裁判管轄）</h2>
              <ol className="list-decimal pl-6 mt-2 space-y-2">
                <li>本規約の解釈にあたっては、日本法を準拠法とします。</li>
                <li>本サービスに関して紛争が生じた場合には、東京地方裁判所を第一審の専属的合意管轄裁判所とします。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第20条（お問い合わせ）</h2>
              <p>
                本規約に関するお問い合わせは、下記までご連絡ください。
              </p>
              <p className="mt-2">
                エレクス株式会社<br />
                所在地: [住所]<br />
                メール: support@rapinics.co.jp
              </p>
            </section>

            <div className="border-t pt-8 mt-8">
              <p className="text-xs text-gray-400">
                制定日: 2026年3月18日
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
