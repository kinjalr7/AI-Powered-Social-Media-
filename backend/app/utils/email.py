import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
import os
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

def send_report_email(recipient_emails: str, report_path: str, report_name: str):
    """
    Send a report PDF via email using SMTP (configured for Gmail).
    """
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.warning("SMTP credentials not set. Skipping email delivery.")
        return False

    try:
        msg = MIMEMultipart()
        msg['From'] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
        msg['To'] = recipient_emails
        msg['Subject'] = f"Automated Intelligence Report: {report_name}"

        body = f"""
        Hello,

        Please find the automated intelligence report attached: {report_name}.
        
        This report was generated and delivered automatically by the AI Social Intelligence Platform.

        Best regards,
        AI Social Intelligence Team
        """
        msg.attach(MIMEText(body, 'plain'))

        # Attach PDF
        if os.path.exists(report_path):
            with open(report_path, "rb") as f:
                part = MIMEApplication(f.read(), Name=os.path.basename(report_path))
            part['Content-Disposition'] = f'attachment; filename="{os.path.basename(report_path)}"'
            msg.attach(part)
        else:
            logger.error(f"Report file not found for attachment: {report_path}")
            return False

        # Send email
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            if settings.SMTP_TLS:
                server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"Report email sent successfully to {recipient_emails}")
        return True
    except Exception as e:
        logger.error(f"Failed to send report email: {str(e)}")
        return False
