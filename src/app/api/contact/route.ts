import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getTranslations } from "next-intl/server";

// Тип для данных формы
interface ContactFormData {
  name: string;
  email: string;
  company: string;
  description: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();
    const { name, email, company, description } = body;

    // Получаем локаль из заголовков или используем русский по умолчанию
    const locale = request.headers.get('accept-language')?.includes('kk') ? 'kk' : 
                   request.headers.get('accept-language')?.includes('en') ? 'en' : 'ru';
    
    const t = await getTranslations({ locale });

    // Валидация данных
    if (!name || !email || !company || !description) {
      return NextResponse.json(
        { error: t("contact.form.validation.allFieldsRequired") },
        { status: 400 }
      );
    }

    // Создание транспортера для отправки email
    // Для production рекомендуется использовать переменные окружения
    const transporter = nodemailer.createTransport({
      service: "gmail", // или другой SMTP сервис
      auth: {
        user: process.env.EMAIL_USER, // ваш email
        pass: process.env.EMAIL_PASS, // пароль приложения
      },
    });

    // Настройка письма
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "n.kadirov@ipec-energy.com",
      subject: t("contact.form.messages.emailSubject", { name, company }),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            Новое обращение с сайта IPEC Energy
          </h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #495057; margin-top: 0;">Информация о клиенте:</h3>
            <p><strong>Имя:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Компания:</strong> ${company}</p>
          </div>

          <div style="background-color: #fff; padding: 20px; border-left: 4px solid #007bff; margin: 20px 0;">
            <h3 style="color: #495057; margin-top: 0;">Описание обращения:</h3>
            <p style="line-height: 1.6; color: #333;">${description}</p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 12px; color: #6c757d;">
            <p>Это письмо было отправлено автоматически с сайта IPEC Energy Kazakhstan.</p>
            <p>Дата отправки: ${new Date().toLocaleString("ru-RU", {
              timeZone: "Asia/Almaty",
            })}</p>
          </div>
        </div>
      `,
      // Также добавим текстовую версию
      text: `
        Новое обращение с сайта IPEC Energy Kazakhstan

        Имя: ${name}
        Email: ${email}
        Компания: ${company}

        Описание обращения:
        ${description}

        Дата отправки: ${new Date().toLocaleString("ru-RU", {
          timeZone: "Asia/Almaty",
        })}
      `,
    };

    // Отправка письма
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: t("contact.form.messages.successResponse") },
      { status: 200 }
    );
  } catch (error) {
    console.error("Ошибка отправки email:", error);
    return NextResponse.json(
      { error: t("contact.form.messages.errorSubmitting") },
      { status: 500 }
    );
  }
}