import * as React from "react"
import * as Ph from "@phosphor-icons/react/dist/ssr"
import type { Icon as PhosphorIcon, IconWeight } from "@phosphor-icons/react"

/**
 * Bộ icon chuẩn SMEOS (Phosphor, PO 30/10/2026) — giữ tên kiểu lucide để thay
 * `from "@/components/ui/icons"` bằng `from "@/components/ui/icons"` mà không đổi chỗ dùng.
 * Mặc định nét `regular`; `strokeWidth ≥ 2.5` → `bold`; có `fill` → `fill`.
 * Ô icon lớn dùng `IconTile` (`app-icon.tsx`). Icon mới: thêm vào đây, không import lucide.
 */

type IconProps = Omit<React.SVGProps<SVGSVGElement>, "ref"> & {
  size?: number | string
  strokeWidth?: number | string
  absoluteStrokeWidth?: boolean
  weight?: IconWeight
}

export type LucideProps = IconProps
export type LucideIcon = React.ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>>

function w(P: PhosphorIcon): LucideIcon {
  const C = React.forwardRef<SVGSVGElement, IconProps>(function Icon(
    { size = 24, strokeWidth, absoluteStrokeWidth, weight, fill, ...rest },
    ref,
  ) {
    void absoluteStrokeWidth
    const auto: IconWeight = fill && fill !== "none" ? "fill" : Number(strokeWidth) >= 2.5 ? "bold" : "regular"
    return <P ref={ref} size={size} weight={weight ?? auto} {...(rest as Record<string, unknown>)} />
  })
  C.displayName = P.displayName
  return C
}

/* eslint-disable @typescript-eslint/naming-convention */
// `/*#__PURE__*/`: lời gọi `w(...)` không có tác dụng phụ → bundler bỏ được icon trang không dùng
// (trước đó mọi trang tải đủ ~236 icon × 6 nét vẽ trong một chunk chung 174 KB gzip).
export const Activity = /*#__PURE__*/ w(Ph.Pulse), AlertCircle = /*#__PURE__*/ w(Ph.WarningCircle), AlertOctagon = /*#__PURE__*/ w(Ph.WarningOctagon)
export const AlertTriangle = /*#__PURE__*/ w(Ph.Warning), Archive = /*#__PURE__*/ w(Ph.Archive), ArrowDown = /*#__PURE__*/ w(Ph.ArrowDown)
export const ArrowDownCircle = /*#__PURE__*/ w(Ph.ArrowCircleDown), ArrowDownLeft = /*#__PURE__*/ w(Ph.ArrowDownLeft), ArrowLeft = /*#__PURE__*/ w(Ph.ArrowLeft)
export const ArrowLeftRight = /*#__PURE__*/ w(Ph.ArrowsLeftRight), ArrowRight = /*#__PURE__*/ w(Ph.ArrowRight), ArrowUp = /*#__PURE__*/ w(Ph.ArrowUp)
export const ArrowUpDown = /*#__PURE__*/ w(Ph.ArrowsDownUp), ArrowUpRight = /*#__PURE__*/ w(Ph.ArrowUpRight), ArrowDownRight = /*#__PURE__*/ w(Ph.ArrowDownRight), Award = /*#__PURE__*/ w(Ph.Medal)
export const BadgeCheck = /*#__PURE__*/ w(Ph.SealCheck), BadgePercent = /*#__PURE__*/ w(Ph.SealPercent), Ban = /*#__PURE__*/ w(Ph.Prohibit)
export const Banknote = /*#__PURE__*/ w(Ph.Money), BarChart3 = /*#__PURE__*/ w(Ph.ChartBar), Bed = /*#__PURE__*/ w(Ph.Bed)
export const Bell = /*#__PURE__*/ w(Ph.Bell), BellRing = /*#__PURE__*/ w(Ph.BellRinging), Bike = /*#__PURE__*/ w(Ph.Bicycle)
export const BookOpen = /*#__PURE__*/ w(Ph.BookOpen), Bookmark = /*#__PURE__*/ w(Ph.BookmarkSimple), Bot = /*#__PURE__*/ w(Ph.Robot)
export const Brain = /*#__PURE__*/ w(Ph.Brain), Briefcase = /*#__PURE__*/ w(Ph.Briefcase), Building = /*#__PURE__*/ w(Ph.Building)
export const Building2 = /*#__PURE__*/ w(Ph.Buildings), Calculator = /*#__PURE__*/ w(Ph.Calculator), Calendar = /*#__PURE__*/ w(Ph.Calendar)
export const CalendarCheck = /*#__PURE__*/ w(Ph.CalendarCheck), CalendarClock = /*#__PURE__*/ w(Ph.CalendarDots), CalendarDays = /*#__PURE__*/ w(Ph.CalendarDots)
export const CalendarHeart = /*#__PURE__*/ w(Ph.CalendarHeart), CalendarIcon = /*#__PURE__*/ w(Ph.Calendar), CalendarRange = /*#__PURE__*/ w(Ph.CalendarDots)
export const CalendarX = /*#__PURE__*/ w(Ph.CalendarX), Camera = /*#__PURE__*/ w(Ph.Camera), Car = /*#__PURE__*/ w(Ph.Car)
export const Check = /*#__PURE__*/ w(Ph.Check), CheckCircle = /*#__PURE__*/ w(Ph.CheckCircle), CheckCircle2 = /*#__PURE__*/ w(Ph.CheckCircle)
export const CheckSquare = /*#__PURE__*/ w(Ph.CheckSquare), ChevronDown = /*#__PURE__*/ w(Ph.CaretDown), ChevronLeft = /*#__PURE__*/ w(Ph.CaretLeft)
export const ChevronRight = /*#__PURE__*/ w(Ph.CaretRight), ChevronUp = /*#__PURE__*/ w(Ph.CaretUp), Circle = /*#__PURE__*/ w(Ph.Circle)
export const CircleDollarSign = /*#__PURE__*/ w(Ph.CurrencyCircleDollar), CircleHelp = /*#__PURE__*/ w(Ph.Question), Clapperboard = /*#__PURE__*/ w(Ph.FilmSlate)
export const ClipboardCheck = /*#__PURE__*/ w(Ph.ClipboardText), ClipboardList = /*#__PURE__*/ w(Ph.ClipboardText), Clock = /*#__PURE__*/ w(Ph.Clock)
export const Cloud = /*#__PURE__*/ w(Ph.Cloud), Coffee = /*#__PURE__*/ w(Ph.Coffee), Coins = /*#__PURE__*/ w(Ph.Coins)
export const Compass = /*#__PURE__*/ w(Ph.Compass), Contact = /*#__PURE__*/ w(Ph.AddressBook), Copy = /*#__PURE__*/ w(Ph.Copy)
export const CopyPlus = /*#__PURE__*/ w(Ph.CopySimple), CornerUpLeft = /*#__PURE__*/ w(Ph.ArrowBendUpLeft), Cpu = /*#__PURE__*/ w(Ph.Cpu)
export const CreditCard = /*#__PURE__*/ w(Ph.CreditCard), Crown = /*#__PURE__*/ w(Ph.Crown), Database = /*#__PURE__*/ w(Ph.Database)
export const DollarSign = /*#__PURE__*/ w(Ph.CurrencyDollar), Download = /*#__PURE__*/ w(Ph.DownloadSimple), Edit = /*#__PURE__*/ w(Ph.PencilSimpleLine)
export const Edit2 = /*#__PURE__*/ w(Ph.PencilSimple), Edit3 = /*#__PURE__*/ w(Ph.PencilLine), Eraser = /*#__PURE__*/ w(Ph.Eraser)
export const ExternalLink = /*#__PURE__*/ w(Ph.ArrowSquareOut), Eye = /*#__PURE__*/ w(Ph.Eye), EyeOff = /*#__PURE__*/ w(Ph.EyeSlash)
export const FileCheck = /*#__PURE__*/ w(Ph.FileArrowDown), FileCheck2 = /*#__PURE__*/ w(Ph.FileText), FileCode = /*#__PURE__*/ w(Ph.FileCode)
export const FileDown = /*#__PURE__*/ w(Ph.FileArrowDown), FileEdit = /*#__PURE__*/ w(Ph.NotePencil), FileInput = /*#__PURE__*/ w(Ph.FileArrowUp)
export const FileOutput = /*#__PURE__*/ w(Ph.FileArrowDown), FileSpreadsheet = /*#__PURE__*/ w(Ph.FileXls), FileText = /*#__PURE__*/ w(Ph.FileText)
export const Film = /*#__PURE__*/ w(Ph.FilmStrip), Filter = /*#__PURE__*/ w(Ph.Funnel), Flame = /*#__PURE__*/ w(Ph.Flame)
export const FlaskConical = /*#__PURE__*/ w(Ph.Flask), Flower2 = /*#__PURE__*/ w(Ph.Flower), Folder = /*#__PURE__*/ w(Ph.Folder)
export const FolderCheck = /*#__PURE__*/ w(Ph.FolderSimpleStar), FolderUp = /*#__PURE__*/ w(Ph.FolderSimplePlus), Gauge = /*#__PURE__*/ w(Ph.Gauge)
export const Gift = /*#__PURE__*/ w(Ph.Gift), GitMerge = /*#__PURE__*/ w(Ph.GitMerge), Globe = /*#__PURE__*/ w(Ph.Globe)
export const Globe2 = /*#__PURE__*/ w(Ph.GlobeHemisphereEast), Grid = /*#__PURE__*/ w(Ph.GridFour), Hammer = /*#__PURE__*/ w(Ph.Hammer)
export const Hand = /*#__PURE__*/ w(Ph.Hand), Handshake = /*#__PURE__*/ w(Ph.Handshake), Hash = /*#__PURE__*/ w(Ph.Hash)
export const Headphones = /*#__PURE__*/ w(Ph.Headphones), Heart = /*#__PURE__*/ w(Ph.Heart), HeartHandshake = /*#__PURE__*/ w(Ph.Handshake)
export const HelpCircle = /*#__PURE__*/ w(Ph.Question), History = /*#__PURE__*/ w(Ph.ClockCounterClockwise), Home = /*#__PURE__*/ w(Ph.House)
export const Hourglass = /*#__PURE__*/ w(Ph.Hourglass), IdCard = /*#__PURE__*/ w(Ph.IdentificationCard), Image = /*#__PURE__*/ w(Ph.Image)
export const ImageDown = /*#__PURE__*/ w(Ph.ImageSquare), ImageIcon = /*#__PURE__*/ w(Ph.Image), ImageOff = /*#__PURE__*/ w(Ph.ImageBroken)
export const ImagePlus = /*#__PURE__*/ w(Ph.ImageSquare), ImageUp = /*#__PURE__*/ w(Ph.ImageSquare), Images = /*#__PURE__*/ w(Ph.Images)
export const Inbox = /*#__PURE__*/ w(Ph.Tray), InboxIcon = /*#__PURE__*/ w(Ph.Tray), Info = /*#__PURE__*/ w(Ph.Info)
export const Kanban = /*#__PURE__*/ w(Ph.Kanban), KeyRound = /*#__PURE__*/ w(Ph.Key), Landmark = /*#__PURE__*/ w(Ph.Bank)
export const Layers = /*#__PURE__*/ w(Ph.Stack), LayoutDashboard = /*#__PURE__*/ w(Ph.SquaresFour), LayoutGrid = /*#__PURE__*/ w(Ph.SquaresFour)
export const LayoutList = /*#__PURE__*/ w(Ph.ListDashes), LayoutTemplate = /*#__PURE__*/ w(Ph.Layout), Leaf = /*#__PURE__*/ w(Ph.Leaf)
export const Library = /*#__PURE__*/ w(Ph.Books), Lightbulb = /*#__PURE__*/ w(Ph.Lightbulb), Link = /*#__PURE__*/ w(Ph.Link)
export const Link2 = /*#__PURE__*/ w(Ph.LinkSimple), LinkIcon = /*#__PURE__*/ w(Ph.Link), List = /*#__PURE__*/ w(Ph.List)
export const ListChecks = /*#__PURE__*/ w(Ph.ListChecks), ListFilter = /*#__PURE__*/ w(Ph.FunnelSimple), Loader2 = /*#__PURE__*/ w(Ph.CircleNotch)
export const Lock = /*#__PURE__*/ w(Ph.Lock), LockKeyhole = /*#__PURE__*/ w(Ph.LockKey), LogIn = /*#__PURE__*/ w(Ph.SignIn)
export const LogOut = /*#__PURE__*/ w(Ph.SignOut), Mail = /*#__PURE__*/ w(Ph.Envelope), MapPin = /*#__PURE__*/ w(Ph.MapPin)
export const Maximize2 = /*#__PURE__*/ w(Ph.ArrowsOut), Megaphone = /*#__PURE__*/ w(Ph.Megaphone), Menu = /*#__PURE__*/ w(Ph.List)
export const MessageCircle = /*#__PURE__*/ w(Ph.ChatCircle), MessageSquare = /*#__PURE__*/ w(Ph.ChatText), MessageSquareHeart = /*#__PURE__*/ w(Ph.ChatCircleText)
export const MessageSquarePlus = /*#__PURE__*/ w(Ph.ChatCenteredText), MessageSquareQuote = /*#__PURE__*/ w(Ph.Quotes), MessageSquareText = /*#__PURE__*/ w(Ph.ChatText)
export const Mic = /*#__PURE__*/ w(Ph.Microphone), Minimize2 = /*#__PURE__*/ w(Ph.ArrowsIn), Minus = /*#__PURE__*/ w(Ph.Minus)
export const Monitor = /*#__PURE__*/ w(Ph.Monitor), Moon = /*#__PURE__*/ w(Ph.Moon), MoreHorizontal = /*#__PURE__*/ w(Ph.DotsThree)
export const Music = /*#__PURE__*/ w(Ph.MusicNotes), Navigation = /*#__PURE__*/ w(Ph.NavigationArrow), Network = /*#__PURE__*/ w(Ph.TreeStructure)
export const Package = /*#__PURE__*/ w(Ph.Package), PackageCheck = /*#__PURE__*/ w(Ph.Package), PackagePlus = /*#__PURE__*/ w(Ph.Package)
export const PackageX = /*#__PURE__*/ w(Ph.Package), Palette = /*#__PURE__*/ w(Ph.Palette), PanelLeftClose = /*#__PURE__*/ w(Ph.SidebarSimple)
export const PanelLeftOpen = /*#__PURE__*/ w(Ph.SidebarSimple), PartyPopper = /*#__PURE__*/ w(Ph.Confetti), Pause = /*#__PURE__*/ w(Ph.Pause)
export const PenTool = /*#__PURE__*/ w(Ph.PenNib), Pencil = /*#__PURE__*/ w(Ph.Pencil), PencilLine = /*#__PURE__*/ w(Ph.PencilLine)
export const Percent = /*#__PURE__*/ w(Ph.Percent), Phone = /*#__PURE__*/ w(Ph.Phone), PhoneCall = /*#__PURE__*/ w(Ph.PhoneCall)
export const Pin = /*#__PURE__*/ w(Ph.PushPin), PinOff = /*#__PURE__*/ w(Ph.PushPinSlash), Plane = /*#__PURE__*/ w(Ph.Airplane)
export const Play = /*#__PURE__*/ w(Ph.Play), Plug = /*#__PURE__*/ w(Ph.Plug), Plus = /*#__PURE__*/ w(Ph.Plus)
export const PlusCircle = /*#__PURE__*/ w(Ph.PlusCircle), Power = /*#__PURE__*/ w(Ph.Power), Presentation = /*#__PURE__*/ w(Ph.PresentationChart)
export const Printer = /*#__PURE__*/ w(Ph.Printer), QrCode = /*#__PURE__*/ w(Ph.QrCode), Quote = /*#__PURE__*/ w(Ph.Quotes)
export const Radio = /*#__PURE__*/ w(Ph.Broadcast), Receipt = /*#__PURE__*/ w(Ph.Receipt), RefreshCw = /*#__PURE__*/ w(Ph.ArrowsClockwise)
export const Repeat = /*#__PURE__*/ w(Ph.Repeat), Rocket = /*#__PURE__*/ w(Ph.Rocket), RotateCcw = /*#__PURE__*/ w(Ph.ArrowCounterClockwise)
export const Rss = /*#__PURE__*/ w(Ph.Rss), Save = /*#__PURE__*/ w(Ph.FloppyDisk), ScanLine = /*#__PURE__*/ w(Ph.Scan)
export const ScanSearch = /*#__PURE__*/ w(Ph.MagnifyingGlassPlus), Scissors = /*#__PURE__*/ w(Ph.Scissors), Search = /*#__PURE__*/ w(Ph.MagnifyingGlass)
export const Send = /*#__PURE__*/ w(Ph.PaperPlaneTilt), Server = /*#__PURE__*/ w(Ph.HardDrives), Settings = /*#__PURE__*/ w(Ph.GearSix)
export const Settings2 = /*#__PURE__*/ w(Ph.Sliders), Share2 = /*#__PURE__*/ w(Ph.ShareNetwork), Shield = /*#__PURE__*/ w(Ph.Shield)
export const ShieldAlert = /*#__PURE__*/ w(Ph.ShieldWarning), ShieldCheck = /*#__PURE__*/ w(Ph.ShieldCheck), Shirt = /*#__PURE__*/ w(Ph.TShirt)
export const ShoppingBag = /*#__PURE__*/ w(Ph.ShoppingBag), ShoppingCart = /*#__PURE__*/ w(Ph.ShoppingCart), Shuffle = /*#__PURE__*/ w(Ph.Shuffle)
export const Sliders = /*#__PURE__*/ w(Ph.Sliders), SlidersHorizontal = /*#__PURE__*/ w(Ph.SlidersHorizontal), Smartphone = /*#__PURE__*/ w(Ph.DeviceMobile)
export const Sparkles = /*#__PURE__*/ w(Ph.Sparkle), Square = /*#__PURE__*/ w(Ph.Square), Star = /*#__PURE__*/ w(Ph.Star)
export const Store = /*#__PURE__*/ w(Ph.Storefront), Sun = /*#__PURE__*/ w(Ph.Sun), SunMedium = /*#__PURE__*/ w(Ph.SunDim)
export const Table = /*#__PURE__*/ w(Ph.Table), Tag = /*#__PURE__*/ w(Ph.Tag), Tags = /*#__PURE__*/ w(Ph.Tag)
export const Target = /*#__PURE__*/ w(Ph.Target), ThumbsUp = /*#__PURE__*/ w(Ph.ThumbsUp), Ticket = /*#__PURE__*/ w(Ph.Ticket)
export const Timer = /*#__PURE__*/ w(Ph.Timer), Trash2 = /*#__PURE__*/ w(Ph.Trash), TreePine = /*#__PURE__*/ w(Ph.Tree)
export const TrendingUp = /*#__PURE__*/ w(Ph.TrendUp), Trophy = /*#__PURE__*/ w(Ph.Trophy), Truck = /*#__PURE__*/ w(Ph.Truck)
export const Type = /*#__PURE__*/ w(Ph.TextT), Undo2 = /*#__PURE__*/ w(Ph.ArrowUUpLeft), Unlock = /*#__PURE__*/ w(Ph.LockOpen)
export const Upload = /*#__PURE__*/ w(Ph.UploadSimple), UploadCloud = /*#__PURE__*/ w(Ph.CloudArrowUp), User = /*#__PURE__*/ w(Ph.User)
export const UserCheck = /*#__PURE__*/ w(Ph.UserCheck), UserCircle = /*#__PURE__*/ w(Ph.UserCircle), UserCog = /*#__PURE__*/ w(Ph.UserGear)
export const UserPlus = /*#__PURE__*/ w(Ph.UserPlus), UserRound = /*#__PURE__*/ w(Ph.User), Users = /*#__PURE__*/ w(Ph.Users)
export const Utensils = /*#__PURE__*/ w(Ph.ForkKnife), Video = /*#__PURE__*/ w(Ph.VideoCamera), Volume2 = /*#__PURE__*/ w(Ph.SpeakerHigh)
export const VolumeX = /*#__PURE__*/ w(Ph.SpeakerSlash), Wallet = /*#__PURE__*/ w(Ph.Wallet), WalletCards = /*#__PURE__*/ w(Ph.Cards)
export const Wand2 = /*#__PURE__*/ w(Ph.MagicWand), Wrench = /*#__PURE__*/ w(Ph.Wrench), X = /*#__PURE__*/ w(Ph.X)
export const XCircle = /*#__PURE__*/ w(Ph.XCircle), XIcon = /*#__PURE__*/ w(Ph.X), Zap = /*#__PURE__*/ w(Ph.Lightning)
export const ZoomIn = /*#__PURE__*/ w(Ph.MagnifyingGlassPlus), ZoomOut = /*#__PURE__*/ w(Ph.MagnifyingGlassMinus)
