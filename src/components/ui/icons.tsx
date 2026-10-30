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
export const Activity = w(Ph.Pulse), AlertCircle = w(Ph.WarningCircle), AlertOctagon = w(Ph.WarningOctagon)
export const AlertTriangle = w(Ph.Warning), Archive = w(Ph.Archive), ArrowDown = w(Ph.ArrowDown)
export const ArrowDownCircle = w(Ph.ArrowCircleDown), ArrowDownLeft = w(Ph.ArrowDownLeft), ArrowLeft = w(Ph.ArrowLeft)
export const ArrowLeftRight = w(Ph.ArrowsLeftRight), ArrowRight = w(Ph.ArrowRight), ArrowUp = w(Ph.ArrowUp)
export const ArrowUpDown = w(Ph.ArrowsDownUp), ArrowUpRight = w(Ph.ArrowUpRight), Award = w(Ph.Medal)
export const BadgeCheck = w(Ph.SealCheck), BadgePercent = w(Ph.SealPercent), Ban = w(Ph.Prohibit)
export const Banknote = w(Ph.Money), BarChart3 = w(Ph.ChartBar), Bed = w(Ph.Bed)
export const Bell = w(Ph.Bell), BellRing = w(Ph.BellRinging), Bike = w(Ph.Bicycle)
export const BookOpen = w(Ph.BookOpen), Bookmark = w(Ph.BookmarkSimple), Bot = w(Ph.Robot)
export const Brain = w(Ph.Brain), Briefcase = w(Ph.Briefcase), Building = w(Ph.Building)
export const Building2 = w(Ph.Buildings), Calculator = w(Ph.Calculator), Calendar = w(Ph.Calendar)
export const CalendarCheck = w(Ph.CalendarCheck), CalendarClock = w(Ph.CalendarDots), CalendarDays = w(Ph.CalendarDots)
export const CalendarHeart = w(Ph.CalendarHeart), CalendarIcon = w(Ph.Calendar), CalendarRange = w(Ph.CalendarDots)
export const CalendarX = w(Ph.CalendarX), Camera = w(Ph.Camera), Car = w(Ph.Car)
export const Check = w(Ph.Check), CheckCircle = w(Ph.CheckCircle), CheckCircle2 = w(Ph.CheckCircle)
export const CheckSquare = w(Ph.CheckSquare), ChevronDown = w(Ph.CaretDown), ChevronLeft = w(Ph.CaretLeft)
export const ChevronRight = w(Ph.CaretRight), ChevronUp = w(Ph.CaretUp), Circle = w(Ph.Circle)
export const CircleDollarSign = w(Ph.CurrencyCircleDollar), CircleHelp = w(Ph.Question), Clapperboard = w(Ph.FilmSlate)
export const ClipboardCheck = w(Ph.ClipboardText), ClipboardList = w(Ph.ClipboardText), Clock = w(Ph.Clock)
export const Cloud = w(Ph.Cloud), Coffee = w(Ph.Coffee), Coins = w(Ph.Coins)
export const Compass = w(Ph.Compass), Contact = w(Ph.AddressBook), Copy = w(Ph.Copy)
export const CopyPlus = w(Ph.CopySimple), CornerUpLeft = w(Ph.ArrowBendUpLeft), Cpu = w(Ph.Cpu)
export const CreditCard = w(Ph.CreditCard), Crown = w(Ph.Crown), Database = w(Ph.Database)
export const DollarSign = w(Ph.CurrencyDollar), Download = w(Ph.DownloadSimple), Edit = w(Ph.PencilSimpleLine)
export const Edit2 = w(Ph.PencilSimple), Edit3 = w(Ph.PencilLine), Eraser = w(Ph.Eraser)
export const ExternalLink = w(Ph.ArrowSquareOut), Eye = w(Ph.Eye), EyeOff = w(Ph.EyeSlash)
export const FileCheck = w(Ph.FileArrowDown), FileCheck2 = w(Ph.FileText), FileCode = w(Ph.FileCode)
export const FileDown = w(Ph.FileArrowDown), FileEdit = w(Ph.NotePencil), FileInput = w(Ph.FileArrowUp)
export const FileOutput = w(Ph.FileArrowDown), FileSpreadsheet = w(Ph.FileXls), FileText = w(Ph.FileText)
export const Film = w(Ph.FilmStrip), Filter = w(Ph.Funnel), Flame = w(Ph.Flame)
export const FlaskConical = w(Ph.Flask), Flower2 = w(Ph.Flower), Folder = w(Ph.Folder)
export const FolderCheck = w(Ph.FolderSimpleStar), FolderUp = w(Ph.FolderSimplePlus), Gauge = w(Ph.Gauge)
export const Gift = w(Ph.Gift), GitMerge = w(Ph.GitMerge), Globe = w(Ph.Globe)
export const Globe2 = w(Ph.GlobeHemisphereEast), Grid = w(Ph.GridFour), Hammer = w(Ph.Hammer)
export const Hand = w(Ph.Hand), Handshake = w(Ph.Handshake), Hash = w(Ph.Hash)
export const Headphones = w(Ph.Headphones), Heart = w(Ph.Heart), HeartHandshake = w(Ph.Handshake)
export const HelpCircle = w(Ph.Question), History = w(Ph.ClockCounterClockwise), Home = w(Ph.House)
export const Hourglass = w(Ph.Hourglass), IdCard = w(Ph.IdentificationCard), Image = w(Ph.Image)
export const ImageDown = w(Ph.ImageSquare), ImageIcon = w(Ph.Image), ImageOff = w(Ph.ImageBroken)
export const ImagePlus = w(Ph.ImageSquare), ImageUp = w(Ph.ImageSquare), Images = w(Ph.Images)
export const Inbox = w(Ph.Tray), InboxIcon = w(Ph.Tray), Info = w(Ph.Info)
export const Kanban = w(Ph.Kanban), KeyRound = w(Ph.Key), Landmark = w(Ph.Bank)
export const Layers = w(Ph.Stack), LayoutDashboard = w(Ph.SquaresFour), LayoutGrid = w(Ph.SquaresFour)
export const LayoutList = w(Ph.ListDashes), LayoutTemplate = w(Ph.Layout), Leaf = w(Ph.Leaf)
export const Library = w(Ph.Books), Lightbulb = w(Ph.Lightbulb), Link = w(Ph.Link)
export const Link2 = w(Ph.LinkSimple), LinkIcon = w(Ph.Link), List = w(Ph.List)
export const ListChecks = w(Ph.ListChecks), ListFilter = w(Ph.FunnelSimple), Loader2 = w(Ph.CircleNotch)
export const Lock = w(Ph.Lock), LockKeyhole = w(Ph.LockKey), LogIn = w(Ph.SignIn)
export const LogOut = w(Ph.SignOut), Mail = w(Ph.Envelope), MapPin = w(Ph.MapPin)
export const Maximize2 = w(Ph.ArrowsOut), Megaphone = w(Ph.Megaphone), Menu = w(Ph.List)
export const MessageCircle = w(Ph.ChatCircle), MessageSquare = w(Ph.ChatText), MessageSquareHeart = w(Ph.ChatCircleText)
export const MessageSquarePlus = w(Ph.ChatCenteredText), MessageSquareQuote = w(Ph.Quotes), MessageSquareText = w(Ph.ChatText)
export const Mic = w(Ph.Microphone), Minimize2 = w(Ph.ArrowsIn), Minus = w(Ph.Minus)
export const Monitor = w(Ph.Monitor), Moon = w(Ph.Moon), MoreHorizontal = w(Ph.DotsThree)
export const Music = w(Ph.MusicNotes), Navigation = w(Ph.NavigationArrow), Network = w(Ph.TreeStructure)
export const Package = w(Ph.Package), PackageCheck = w(Ph.Package), PackagePlus = w(Ph.Package)
export const PackageX = w(Ph.Package), Palette = w(Ph.Palette), PanelLeftClose = w(Ph.SidebarSimple)
export const PanelLeftOpen = w(Ph.SidebarSimple), PartyPopper = w(Ph.Confetti), Pause = w(Ph.Pause)
export const PenTool = w(Ph.PenNib), Pencil = w(Ph.Pencil), PencilLine = w(Ph.PencilLine)
export const Percent = w(Ph.Percent), Phone = w(Ph.Phone), PhoneCall = w(Ph.PhoneCall)
export const Pin = w(Ph.PushPin), PinOff = w(Ph.PushPinSlash), Plane = w(Ph.Airplane)
export const Play = w(Ph.Play), Plug = w(Ph.Plug), Plus = w(Ph.Plus)
export const PlusCircle = w(Ph.PlusCircle), Power = w(Ph.Power), Presentation = w(Ph.PresentationChart)
export const Printer = w(Ph.Printer), QrCode = w(Ph.QrCode), Quote = w(Ph.Quotes)
export const Radio = w(Ph.Broadcast), Receipt = w(Ph.Receipt), RefreshCw = w(Ph.ArrowsClockwise)
export const Repeat = w(Ph.Repeat), Rocket = w(Ph.Rocket), RotateCcw = w(Ph.ArrowCounterClockwise)
export const Rss = w(Ph.Rss), Save = w(Ph.FloppyDisk), ScanLine = w(Ph.Scan)
export const ScanSearch = w(Ph.MagnifyingGlassPlus), Scissors = w(Ph.Scissors), Search = w(Ph.MagnifyingGlass)
export const Send = w(Ph.PaperPlaneTilt), Server = w(Ph.HardDrives), Settings = w(Ph.GearSix)
export const Settings2 = w(Ph.Sliders), Share2 = w(Ph.ShareNetwork), Shield = w(Ph.Shield)
export const ShieldAlert = w(Ph.ShieldWarning), ShieldCheck = w(Ph.ShieldCheck), Shirt = w(Ph.TShirt)
export const ShoppingBag = w(Ph.ShoppingBag), ShoppingCart = w(Ph.ShoppingCart), Shuffle = w(Ph.Shuffle)
export const Sliders = w(Ph.Sliders), SlidersHorizontal = w(Ph.SlidersHorizontal), Smartphone = w(Ph.DeviceMobile)
export const Sparkles = w(Ph.Sparkle), Square = w(Ph.Square), Star = w(Ph.Star)
export const Store = w(Ph.Storefront), Sun = w(Ph.Sun), SunMedium = w(Ph.SunDim)
export const Table = w(Ph.Table), Tag = w(Ph.Tag), Tags = w(Ph.Tag)
export const Target = w(Ph.Target), ThumbsUp = w(Ph.ThumbsUp), Ticket = w(Ph.Ticket)
export const Timer = w(Ph.Timer), Trash2 = w(Ph.Trash), TreePine = w(Ph.Tree)
export const TrendingUp = w(Ph.TrendUp), Trophy = w(Ph.Trophy), Truck = w(Ph.Truck)
export const Type = w(Ph.TextT), Undo2 = w(Ph.ArrowUUpLeft), Unlock = w(Ph.LockOpen)
export const Upload = w(Ph.UploadSimple), UploadCloud = w(Ph.CloudArrowUp), User = w(Ph.User)
export const UserCheck = w(Ph.UserCheck), UserCircle = w(Ph.UserCircle), UserCog = w(Ph.UserGear)
export const UserPlus = w(Ph.UserPlus), UserRound = w(Ph.User), Users = w(Ph.Users)
export const Utensils = w(Ph.ForkKnife), Video = w(Ph.VideoCamera), Volume2 = w(Ph.SpeakerHigh)
export const VolumeX = w(Ph.SpeakerSlash), Wallet = w(Ph.Wallet), WalletCards = w(Ph.Cards)
export const Wand2 = w(Ph.MagicWand), Wrench = w(Ph.Wrench), X = w(Ph.X)
export const XCircle = w(Ph.XCircle), XIcon = w(Ph.X), Zap = w(Ph.Lightning)
export const ZoomIn = w(Ph.MagnifyingGlassPlus), ZoomOut = w(Ph.MagnifyingGlassMinus)
