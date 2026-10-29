/**
 * Landing Page 7-Section Content Generator.
 * Hợp nhất 3 nguồn: Business Profile + Dynamic Market/Product Signals + User Directives.
 * Pure Domain - Không phụ thuộc DB hay mạng.
 */

import { type ToneOfVoice } from "./flower-content-presets"
import { sanitizeFlowerText } from "./flower-banned-dictionary"

export interface LandingContentInput {
  shopName: string
  shopTone?: ToneOfVoice | string | undefined
  occasionId: string
  occasionLabel: string
  archetypeId?: string | undefined
  selectedProducts: Array<{
    name: string
    code?: string | undefined
    price?: number | null | undefined
    category?: string | null | undefined
  }>
  userDirectives?: string | undefined
  discountPercent?: number | undefined
  pageGoal?: string | undefined
  usps?: string[] | undefined
  guarantees?: string[] | undefined
  targetAudience?: string | undefined
  designDirection?: string | undefined
}

export interface LandingSectionHero {
  badge: string
  headline: string
  subHeadline: string
  countdownLabel: string
}

export interface LandingSectionStory {
  title: string
  paragraphs: string[]
  quote: string
  floristName: string
}

export interface LandingSectionPerk {
  id: string
  title: string
  description: string
  icon: "camera" | "clock" | "shield" | "gift"
}

export interface LandingSectionStep {
  step: number
  title: string
  description: string
}

export interface LandingSectionFaq {
  question: string
  answer: string
}

export interface LandingSectionLead {
  tag: string
  title: string
  description: string
  discountBadge: string
  urgencyNotice: string
}

export interface GeneratedLandingPackage {
  hero: LandingSectionHero
  story: LandingSectionStory
  perks: LandingSectionPerk[]
  steps: LandingSectionStep[]
  faq: LandingSectionFaq[]
  lead: LandingSectionLead
}

/**
 * Sinh gói nội dung hoàn chỉnh cho 7 Sections của Landing Page
 */
export function generateLandingPageContent(input: LandingContentInput): GeneratedLandingPackage {
  const shop = input.shopName || "Tiệm hoa smeOS"
  const occasion = input.occasionLabel || "Dịp Đặc Biệt"
  const directive = input.userDirectives ? sanitizeFlowerText(input.userDirectives) : ""
  // Ưu đãi chỉ khi tiệm bật "Giảm %" trong Hồ sơ tiệm — không có thì không hứa giảm giá
  const discount = input.discountPercent

  const primaryProduct = input.selectedProducts[0]?.name || "những tác phẩm sản phẩm tuyển chọn"
  const flowerCount = input.selectedProducts.length

  // 1. Hero Content — Đa dạng biến thể (Stochastic Variant Pool)
  const heroBadgeOptions = [
    `Bộ Sưu Tập Giới Hạn • Mừng ${occasion}`,
    `Tuyệt Tác Thiết Kế • Dịp ${occasion}`,
    `Bộ Sưu Tập Độc Bản • Mùa ${occasion}`,
    `Tuyển Chọn Tinh Hoa • Chào ${occasion}`,
  ]
  const heroBadge = heroBadgeOptions[Math.floor(Math.random() * heroBadgeOptions.length)] ?? `Bộ Sưu Tập Giới Hạn • Mừng ${occasion}`

  const headlinePools: Record<string, Array<{ headline: string; sub: string }>> = {
    "20-10": [
      {
        headline: `Tôn Vinh Phái Đẹp — Ngàn Lời Tri Ân Gửi Trao Ngày ${occasion}`,
        sub: `Mỗi cánh hoa là một lời cảm ơn sâu sắc gửi đến người phụ nữ tuyệt vời nhất trong cuộc đời bạn. Thiết kế độc bản bởi nghệ nhân ${shop}.`,
      },
      {
        headline: `Thay Ngàn Lời Yêu — Tuyệt Tác Sản Phẩm Dành Riêng Cho Nàng`,
        sub: `Những thiết kế được ${shop} chọn riêng cho dịp này, thay bạn gửi gắm trọn vẹn tình cảm chân thành và sự tinh tế.`,
      },
      {
        headline: `Đóa Hoa Cảm Xúc — Tỏa Sáng Nét Duyên Dáng Của Người Phụ Nữ Bạn Yêu`,
        sub: `Sự kết hợp hoàn mỹ giữa nét đẹp thanh tao và nghệ thuật chế tác hiện đại tại ${shop}, món quà xứng tầm trao gửi trân quý.`,
      },
      {
        headline: `Trao Gửi Trân Quý — Món Quà Hoàn Hảo Chạm Đến Trái Tim`,
        sub: `Dành tặng mẹ, vợ, đối tác hay người thương những đóa sản phẩm sớm tinh khôi từ ${shop}, lưu giữ khoảnh khắc ngọt ngào ngày ${occasion}.`,
      },
    ],
    "valentine": [
      {
        headline: `Gửi Trọn Tình Yêu — Ngọt Ngào & Nồng Nàn Mùa Lễ Tình Nhân`,
        sub: `Những đóa hồng được ${shop} chọn lựa kỹ, minh chứng cho tình yêu và sự chân thành sâu sắc nhất.`,
      },
      {
        headline: `Khoảnh Khắc Tỏ Tình — Rung Động Con Tim Mùa Lễ Tình Nhân`,
        sub: `Từng cánh hồng nhung đỏ thắm được phối cùng hoa baby dịu dàng từ ${shop}, tạo nên bản hòa ca lãng mạn bất tận.`,
      },
    ],
    "khai-truong": [
      {
        headline: `Khai Trương Hồng Phát — Tài Lộc Tấn Tới, Vạn Sự Hanh Thông`,
        sub: `Kệ hoa và giỏ hoa chúc mừng từ ${shop} mang sắc màu đại cát, chúc đối tác kinh doanh phát tài, may mắn khởi sắc.`,
      },
      {
        headline: `Khai Trương Hồng Phát — Đại Cát Đại Lợi, Đón Đầu Thịnh Vượng`,
        sub: `Thiết kế hoa chúc mừng sang trọng, nổi bật và trang nghiêm từ ${shop}, thay lời chúc đối tác mã đáo thành công.`,
      },
    ],
  }

  const defaultOccasionPool = [
    {
      headline: `Trao Yêu Thương Trọn Vẹn — Tôn Vinh Khoảnh Khắc ${occasion}`,
      sub: `Những mẫu được ${shop} chọn riêng, gửi gắm trọn vẹn tình cảm và sự tinh tế đến người bạn trân quý.`,
    },
    {
      headline: `Sắc Sản Phẩm Mới — Rạng Rỡ Khoảnh Khắc Kỷ Niệm ${occasion}`,
      sub: `Mỗi tác phẩm hoa tại ${shop} là một bản giao hưởng màu sắc, đem niềm vui bất ngờ và hạnh phúc ngập tràn đến người nhận.`,
    },
    {
      headline: `Món Quà Tinh Tế — Gắn Kết Yêu Thương Dịp ${occasion}`,
      sub: `Trao sản phẩm, gửi tấm lòng. Những thiết kế độc quyền từ nghệ nhân ${shop} giúp lời chúc mừng của bạn trở nên đáng nhớ hơn bao giờ hết.`,
    },
  ]

  const activePool = headlinePools[input.occasionId] || defaultOccasionPool
  const pickedVariant = activePool[Math.floor(Math.random() * activePool.length)] ?? activePool[0]!
  let heroHeadline = pickedVariant.headline
  let heroSubHeadline = pickedVariant.sub

  if (directive) {
    heroSubHeadline += ` Điểm nhấn: ${directive}.`
  }

  // 2. Brand & Florist Craftsmanship Story — Biến thể góc kể chuyện
  const storyAngles = [
    {
      title: `Nghệ Thuật Chế Tác & Triết Lý Thương Hiệu Tại ${shop}`,
      paragraphs: [
        `Tại ${shop}, chúng tôi tin rằng sản phẩm không đơn thuần là một món quà, mà là chiếc cầu nối cảm xúc vô giá giữa hai tâm hồn. Mỗi thiết kế trong bộ sưu tập ${occasion} đều được chăm chút tỉ mỉ từ khâu chọn lọc từng đóa sản phẩm sớm tinh khôi đến cách phối màu hài hòa chuẩn phong cách hiện đại.`,
        `Với hơn ${flowerCount > 0 ? `${flowerCount} thiết kế tâm điểm` : "nhiều sản phẩm độc bản"}, tiêu biểu như ${primaryProduct}, mỗi thiết kế tại ${shop} được cắm và kiểm tra kỹ trước khi giao đến người nhận.`,
      ],
      quote: `“Chúng tôi không chỉ tạo ra sản phẩm, chúng tôi gửi gắm cả sự trân trọng và tấm lòng của người tặng vào từng chi tiết sản phẩm.”`,
    },
    {
      title: `Đam Mê Bất Tận Với Từng Đóa Sản Phẩm Tại ${shop}`,
      paragraphs: [
        `Đội ngũ ${shop} tự tay chọn lựa từng thành phần cho mỗi thiết kế. Chúng tôi tin rằng sự chăm chút là điều tạo nên khác biệt cho món quà ${occasion}.`,
        `Tác phẩm ${primaryProduct} cùng các sản phẩm trong chiến dịch lần này mang phong cách tự nhiên, bay bổng nhưng vô cùng thanh lịch, sẵn sàng làm xiêu lòng bất kỳ ai ngay từ ánh nhìn đầu tiên.`,
      ],
      quote: `“Một đóa hoa đẹp có thể thay vạn lời muốn nói, xua tan mọi mỏi mệt và sưởi ấm những trái tim.”`,
    },
    {
      title: `Tiêu Chuẩn Sản Phẩm Cao Cấp & Tinh Hoa Sáng Tạo Tại ${shop}`,
      paragraphs: [
        `Mỗi thiết kế tại ${shop} được chọn thành phần, cắm và kiểm tra kỹ trước khi đến tay người nhận.`,
        `Với bộ sưu tập ${occasion}, ${shop} mong muốn đồng hành cùng quý khách tạo nên những ký ức trọn vẹn, đáng nhớ thông qua các tuyệt tác như ${primaryProduct}.`,
      ],
      quote: `“Sự hài lòng và nụ cười rạng ngời của người nhận chính là thước đo giá trị cao nhất cho tâm huyết của chúng tôi.”`,
    },
  ]

  const pickedStory = storyAngles[Math.floor(Math.random() * storyAngles.length)] ?? storyAngles[0]!
  const storyTitle = pickedStory.title
  const storyParagraphs = pickedStory.paragraphs
  const storyQuote = pickedStory.quote

  // 3. Điểm nổi bật mẫu — không cam kết số giờ, số ngày hay quà tặng khi cửa hàng chưa xác nhận (nội dung lên trang công khai).
  const perks: LandingSectionPerk[] = [
    {
      id: "perk-1",
      title: "Xem ảnh mẫu trước khi đặt",
      description: "Mỗi mẫu trên trang đều có ảnh để bạn chọn đúng thiết kế mình thích.",
      icon: "camera",
    },
    {
      id: "perk-2",
      title: "Giao tận nơi theo hẹn",
      description: "Tiệm liên hệ xác nhận địa chỉ và giờ giao khi bạn đặt.",
      icon: "clock",
    },
    {
      id: "perk-3",
      title: "Chăm chút từng thiết kế",
      description: "Mỗi thiết kế được cắm và kiểm tra kỹ trước khi giao.",
      icon: "shield",
    },
    {
      id: "perk-4",
      title: "Gửi kèm lời chúc",
      description: "Bạn có thể để lại lời nhắn để tiệm gửi cùng món quà.",
      icon: "gift",
    },
  ]

  // 4. 3-Step Ordering Process
  const steps: LandingSectionStep[] = [
    {
      step: 1,
      title: "Chọn mẫu & Gửi thông điệp",
      description: `Lựa chọn thiết kế yêu thích trong bộ sưu tập ${occasion} và để lại nội dung chúc mừng mong muốn.`,
    },
    {
      step: 2,
      title: "Nghệ nhân thực hiện & Chụp duyệt",
      description: `Florist tay nghề cao tại ${shop} tuyển hoa mới cắm và gửi ảnh thực tế qua Zalo cho bạn duyệt trước.`,
    },
    {
      step: 3,
      title: "Giao hoa tận tay & Báo cáo",
      description: "Shipper giao hoa nâng niu đến tận tay người nhận và gửi ảnh xác nhận hoàn tất giao hàng tức thì.",
    },
  ]

  // 5. FAQ Questions & Answers
  const faq: LandingSectionFaq[] = [
    {
      question: "Hoa thực tế khi giao có giống hình mẫu trên trang không?",
      answer: `Thành phần có thể thay đổi nhẹ theo mùa. ${shop} sẽ trao đổi với bạn nếu cần thay thế để giữ đúng tone màu và kiểu dáng.`,
    },
    {
      question: "Tôi cần đặt gấp thì có kịp không?",
      answer: `Hãy liên hệ ${shop} qua hotline hoặc Zalo trên trang — tiệm sẽ báo ngay thời gian sớm nhất có thể giao.`,
    },
    {
      question: "Cửa hàng có xuất hóa đơn cho công ty không?",
      answer: "Vui lòng gửi thông tin doanh nghiệp khi đặt hàng để tiệm xác nhận việc xuất hóa đơn.",
    },
    {
      question: "Chính sách đổi trả hoặc bảo hành sản phẩm như thế nào?",
      answer: `Nếu sản phẩm có vấn đề khi nhận, hãy liên hệ ngay ${shop} kèm ảnh để tiệm hỗ trợ theo chính sách của cửa hàng.`,
    },
  ]

  // 6. Lead Capture & Special Promotion
  const lead: LandingSectionLead = discount
    ? {
        tag: "Đặt trước",
        title: `Nhận Ngay Ưu Đãi ${discount}%`,
        description: `Áp dụng cho quý khách đăng ký đặt trước trong chiến dịch "${occasion}" theo ưu đãi đang áp dụng của ${shop}.`,
        discountBadge: `GIẢM ${discount}%`,
        urgencyNotice: "",
      }
    : {
        tag: "Đặt trước",
        title: "Để lại số điện thoại để được tư vấn mẫu",
        description: `${shop} sẽ liên hệ lại để tư vấn và giữ mẫu cho chiến dịch "${occasion}".`,
        discountBadge: "",
        urgencyNotice: "",
      }

  return {
    hero: {
      badge: heroBadge,
      headline: heroHeadline,
      subHeadline: heroSubHeadline,
      countdownLabel: "Ưu đãi đặt sớm còn:",
    },
    story: {
      title: storyTitle,
      paragraphs: storyParagraphs,
      quote: storyQuote,
      floristName: `Nghệ nhân ${shop}`,
    },
    perks,
    steps,
    faq,
    lead,
  }
}
