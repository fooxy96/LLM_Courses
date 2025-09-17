document.getElementById('send-btn').onclick = async function () {
  const input = document.getElementById('user-input').value.trim();
  if (!input) {
    document.getElementById('response').innerText = "Пожалуйста, введите ваш запрос.";
    return;
  }

  // Блокируем интерфейс во время обработки
  document.getElementById('response').innerText = "Консультант думает...";
  document.getElementById('user-input').disabled = true;
  document.getElementById('send-btn').disabled = true;

  const systemPrompt = `Ты профессиональный консультант по веб-разработке с 10-летним опытом. Твоя задача — помочь клиентам создать современные, функциональные и адаптивные веб-сайты и приложения, оптимизировать их под поисковые системы, интегрировать необходимые сервисы (CRM, платежные системы) и обеспечить техническую поддержку. Ты специализируешься на:
- Корпоративных сайтах с интеграцией CRM и аналитики
- Интернет-магазинах на WooCommerce, Shopify или кастомной разработке
- Продающих лендингах с оптимизацией конверсии
- SEO-оптимизации и технической оптимизации сайтов
- Веб-приложениях с использованием React, Vue, Angular
- Адаптивном дизайне для всех устройств
- Современных фронтенд-решениях (React, Vue, Angular)
- Бэкенд-разработке (Node.js, Python, PHP)
- Интеграции платежных систем (Stripe, PayPal, Яндекс.Касса)
- Обеспечении безопасности (HTTPS, защита от XSS, SQL-инъекций)
- Оптимизации скорости загрузки и производительности

Всегда начинаешь с уточняющих вопросов, чтобы понять бизнес-цели клиента, целевую аудиторию, бюджет и сроки. Предлагаешь конкретные решения с примерами аналогичных проектов, объясняешь преимущества выбранной технологии, сроки реализации и примерную стоимость. Ты профессионально и вежливо отвечаешь на все вопросы, избегаешь сложного жаргона без пояснений и всегда готов помочь с техническими деталями. Пример ответа: 'Здравствуйте! Для создания интернет-магазина мы рекомендуем использовать платформу Shopify или кастомную разработку на Magento. Shopify подойдет для быстрого старта с минимальными затратами, а кастомная разработка — для сложных сценариев. Например, недавно мы реализовали проект для сети магазинов одежды: интегрировали систему учета склада, платежный шлюз, SEO-оптимизацию и мобильную версию. Конверсия выросла на 35%. Какие у вас конкретные требования к функционалу?'`;

  const request = {
    "model": "lakomoor/vikhr-llama-3.2-1b-instruct:1b",
    "messages": [
      {
        "role": "system",
        "content": systemPrompt
      },
      {
        "role": "user",
        "content": input
      }
    ],
    "max_tokens": "300",
    "temperature": "0.5"
  };

  try {
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`HTTP ошибка: ${response.status} ${response.statusText}`);
    }

    const reader = response.body.getReader();
    let result = '';
    document.getElementById('response').innerText = '';
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      try {
        const chunk = decoder.decode(value, { stream: true });
        const responseChunk = JSON.parse(chunk);
        if (responseChunk.message?.content) {
          result += responseChunk.message.content;
          document.getElementById('response').innerText = result;
        }
      } catch (e) {
        console.error("Ошибка обработки чанка:", e);
        continue;
      }
    }
  } catch (e) {
    console.error("Ошибка при запросе к AI:", e);
    document.getElementById('response').innerText = `Ошибка: ${e.message || 'Не удалось связаться с сервисом'}`;
  } finally {
    document.getElementById('user-input').disabled = false;
    document.getElementById('send-btn').disabled = false;
  }
};

// Обработка нажатия Enter для отправки
document.getElementById('user-input').addEventListener('keydown', function(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    document.getElementById('send-btn').click();
  }
});