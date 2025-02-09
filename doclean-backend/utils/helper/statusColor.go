package helper

const (
	Reset  = "\033[0m"
	RedBg  = "\033[41;97m" // Red background, white text (Errors 500+)
	YellowBg = "\033[43;30m" // Yellow background, black text (Client errors 400-499)
	GreenBg = "\033[42;30m" // Green background, black text (Success 200-299)
	CyanBg  = "\033[46;30m" // Cyan background, black text (Redirects 300-399)
)

func ColorForStatus(code int) string {
	switch {
	case code >= 200 && code < 300:
		return GreenBg
	case code >= 300 && code < 400:
		return CyanBg
	case code >= 400:
		return RedBg
	default:
		return Reset
	}
}