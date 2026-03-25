import Head from 'next/head'

export default function PrivacyPage() {
  return (
    <>
      <Head>
        <title>プライバシーポリシー - Sales AI</title>
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

          <h1 className="text-3xl font-bold text-gray-900 mb-8">プライバシーポリシー</h1>

          <div className="prose prose-sm max-w-none text-gray-600 space-y-6">
            <p className="text-sm text-gray-400">最終更新日: 2026年3月18日</p>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. はじめに</h2>
              <p>
                エレクス株式会社（以下「当社」といいます。）は、当社が提供するAI Search Platform（以下「本サービス」といいます。）における
                個人情報の取り扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます。）を定めます。
                当社は、個人情報の保護に関する法律（以下「個人情報保護法」といいます。）その他の関連法令を遵守し、
                ユーザーの個人情報を適切に取り扱います。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. 収集する個人情報</h2>
              <p>当社は、本サービスの提供にあたり、以下の個人情報を収集することがあります。</p>

              <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">2.1 ユーザーから直接提供いただく情報</h3>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>メールアドレス</li>
                <li>パスワード（不可逆的にハッシュ化して保存）</li>
                <li>組織名・テナント情報</li>
                <li>氏名（プロフィールに任意で登録した場合）</li>
                <li>その他、利用登録時またはプロフィール設定時にユーザーが入力した情報</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">2.2 サービス利用に伴い自動的に収集する情報</h3>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>アクセスログ（IPアドレス、ブラウザ情報、アクセス日時）</li>
                <li>ログイン履歴（認証成功・失敗、使用デバイス情報）</li>
                <li>サービス利用状況（検索クエリ、ドキュメントアップロード履歴、チャット利用履歴等）</li>
                <li>操作監査ログ（CRUD操作の記録）</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">2.3 外部認証サービス経由で取得する情報</h3>
              <p>
                ユーザーが外部認証サービス（Google、Microsoft等のOIDCプロバイダー）を利用してログインする場合、
                当該サービスから提供されるメールアドレス、表示名等の情報を取得します。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. 個人情報の利用目的</h2>
              <p>当社は、収集した個人情報を以下の目的で利用します。</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>本サービスの提供、運営、維持</li>
                <li>ユーザー認証およびアカウント管理</li>
                <li>テナント管理およびアクセス制御</li>
                <li>本サービスの改善および新機能の開発</li>
                <li>利用状況の分析および統計情報の作成（個人を識別できない形式で処理）</li>
                <li>セキュリティの確保および不正利用の検知・防止</li>
                <li>重要なお知らせ（サービスの変更、メンテナンス、セキュリティアラート等）の送信</li>
                <li>ユーザーからのお問い合わせへの対応</li>
                <li>利用規約への違反行為への対応</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. 個人情報の第三者提供</h2>
              <p>
                当社は、以下の場合を除き、ユーザーの個人情報を第三者に提供することはありません。
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>ユーザーの事前の同意がある場合</li>
                <li>法令に基づく場合</li>
                <li>人の生命、身体または財産の保護のために必要があり、本人の同意を得ることが困難な場合</li>
                <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合</li>
                <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. 個人情報の委託</h2>
              <p>
                当社は、利用目的の達成に必要な範囲で、個人情報の取り扱いの全部または一部を第三者に委託する場合があります。
                この場合、当社は、委託先との間で個人情報の取り扱いに関する契約を締結し、委託先における個人情報の適切な管理を確保します。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. 安全管理措置</h2>
              <p>当社は、個人情報の漏洩、滅失または毀損の防止のため、以下の安全管理措置を講じます。</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>通信の暗号化（TLS/SSL）</li>
                <li>パスワードの不可逆ハッシュ化による保存</li>
                <li>JWT（JSON Web Token）による安全なセッション管理</li>
                <li>httpOnlyクッキーによるトークンのXSS攻撃からの保護</li>
                <li>ロールベースアクセス制御（RBAC）による権限管理</li>
                <li>テナント分離によるデータの論理的隔離</li>
                <li>アクセスログおよび操作監査ログの記録・監視</li>
                <li>定期的なセキュリティ評価およびアップデートの実施</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. データの保存期間</h2>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>アカウント情報: アカウントが有効な間、および解約後の法定保存期間</li>
                <li>ログイン・操作監査ログ: 1年間</li>
                <li>システムログ: 90日間</li>
                <li>無料プラン（デモアカウント）のデータ: デモ期間終了後に削除される場合があります</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Cookie（クッキー）の利用</h2>
              <p>本サービスでは、以下の目的でCookieを利用しています。</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>ユーザー認証およびセッション管理（httpOnlyクッキーによるJWTトークンの保存）</li>
                <li>セキュリティの確保（CSRF対策、不正アクセス防止）</li>
                <li>ユーザーの利便性向上（ログイン状態の維持等）</li>
              </ul>
              <p className="mt-2">
                なお、本サービスでは広告目的のCookieやサードパーティトラッキングCookieは使用しておりません。
                ブラウザの設定によりCookieを無効にすることは可能ですが、その場合、本サービスの一部機能が正常に動作しない場合があります。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">9. ユーザーコンテンツの取り扱い</h2>
              <ol className="list-decimal pl-6 mt-2 space-y-2">
                <li>ユーザーが本サービスにアップロードしたドキュメント、テキスト等のコンテンツは、テナント単位で論理的に分離して管理されます。</li>
                <li>当社は、ユーザーのコンテンツをAIモデルの学習データとして使用しません。</li>
                <li>AIによる検索・要約・生成処理は、ユーザーのコンテンツに対してのみ実行され、処理結果は当該テナント内でのみ利用されます。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">10. 開示・訂正・削除の請求</h2>
              <p>ユーザーは、当社に対して、個人情報保護法の定めに基づき、以下の請求を行うことができます。</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>個人情報の利用目的の通知</li>
                <li>個人情報の開示</li>
                <li>個人情報の訂正、追加または削除</li>
                <li>個人情報の利用の停止または消去</li>
                <li>個人情報の第三者への提供の停止</li>
              </ul>
              <p className="mt-2">
                上記の請求をされる場合は、下記のお問い合わせ先までご連絡ください。
                本人確認の上、合理的な期間内に対応いたします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">11. プライバシーポリシーの変更</h2>
              <p>
                当社は、必要に応じて本ポリシーを変更することがあります。
                重要な変更がある場合は、本サービス上での告知またはメールによりユーザーに通知します。
                変更後のポリシーは、本サービス上に掲載した時点から効力を生じるものとします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">12. お問い合わせ</h2>
              <p>
                本ポリシーに関するお問い合わせは、下記までご連絡ください。
              </p>
              <p className="mt-2">
                エレクス株式会社　個人情報保護管理者<br />
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
