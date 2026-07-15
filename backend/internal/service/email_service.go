package service

import (
	"fmt"
	"strconv"

	"github.com/Ziyadrifqi/kosthub/backend/internal/config"
	"gopkg.in/gomail.v2"
)

type EmailService struct {
	cfg *config.Config
}

func NewEmailService(cfg *config.Config) *EmailService {
	return &EmailService{cfg: cfg}
}

func (s *EmailService) SendPasswordReset(toEmail, name, resetToken string) error {
	resetLink := fmt.Sprintf("%s/reset-password?token=%s", s.cfg.FrontendURL, resetToken)

	body := fmt.Sprintf(`
		<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
			<h2 style="color: #10B981;">Reset Kata Sandi KostHub</h2>
			<p>Halo %s,</p>
			<p>Kami menerima permintaan untuk reset kata sandi akunmu. Klik tombol di bawah untuk membuat kata sandi baru:</p>
			<p style="margin: 24px 0;">
				<a href="%s" style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
					Reset Kata Sandi
				</a>
			</p>
			<p style="color: #6B7280; font-size: 13px;">Link ini berlaku selama 1 jam. Kalau kamu tidak meminta reset ini, abaikan saja email ini.</p>
		</div>
	`, name, resetLink)

	m := gomail.NewMessage()
	m.SetHeader("From", s.cfg.SMTPFrom)
	m.SetHeader("To", toEmail)
	m.SetHeader("Subject", "Reset Kata Sandi KostHub")
	m.SetBody("text/html", body)

	port, _ := strconv.Atoi(s.cfg.SMTPPort)
	d := gomail.NewDialer(s.cfg.SMTPHost, port, s.cfg.SMTPUser, s.cfg.SMTPPassword)

	return d.DialAndSend(m)
}
