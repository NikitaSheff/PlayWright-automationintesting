import {test, expect} from '@playwright/test';
import {RandomHelper} from '../Helpers/playwrightHelper';
import {responseSite} from "../Helpers/mockResponses";
import {loadConfig} from '../Helpers/configPlugin';
import {MessageFormPage} from "../PO/contactForm";
import { faker } from '@faker-js/faker'; // Для генерации случайных данных
//берем данные из json, для использования в тесте
let config: any;
//можно использовать faker.js, как альтернатива ручной генерации
const RandomName: string = `${RandomHelper.getRandomString()} MyName`
const RandomEmail: string = `${RandomHelper.getRandomString()}@random.com`
//добавил to string тк поле не принимает int
const RandomTel: string = `8${RandomHelper.getRandomInt(9990000000, 9999999999).toString()}`

test.beforeAll(async () => {
    config = await loadConfig();
});
test('UI - Submit contact form', async ({ page }) => {
    const formPage = new MessageFormPage(page);
    const formData = {
        name: RandomName,
        email: RandomEmail,
        phone: RandomTel,
        subject: config.subjectText,
        description: config.descriptionText
    };
    
    await page.goto('/');

    // Проверяем, что форма отображается
    await expect(page.locator('.row.contact').first()).toBeVisible();
    for (const locator of ['#name', '#email', '#phone', '#subject', '#description']) {
        await expect(page.locator(locator)).toBeVisible();
    }

    // Заполняем и отправляем форму
    await formPage.fillForm(formData);
    const [request, response] = await Promise.all([
        page.waitForRequest(req => req.url().includes('message') && req.method() === 'POST'),
        page.waitForResponse(res => res.url().includes('message') && res.status() >= 200 && res.status() < 204),
        await page.getByRole('button', { name: 'Submit' }).click()
    ]);

    // Проверяем ответ сервера
    expect([200, 201]).toContain(response.status());
    const responseBody = await response.json();
    expect(responseBody).toMatchObject(responseSite);

    // Проверяем UI подтверждения
    await expect(page.locator("div[class='col-sm-10'] h2").first()).toBeVisible();
    await expect(page.locator('.row.contact').first()).toContainText('Thanks for getting in touch');
    await expect(page.locator('.row.contact').first()).toContainText(config.subjectText);
});

test('API - Submit contact form via API', async ({ request }) => {
    // Генерация случайных данных
    const formData = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number({style: "international"}),
        subject: faker.lorem.words(10),
        description: faker.lorem.sentence(10)
    };

    // Отправка POST запроса с данными формы
    const response = await request.post('/message/', {
        data: formData
    });

    expect([200, 201]).toContain(response.status());
    // Получение тела ответа
    const responseBody = await response.json();
    // Лог для проверки тела ответа
    console.log('Response Body:', responseBody);

    // Проверка, что ответ содержит нужные данные
    expect(responseBody).toMatchObject(responseSite);
    expect(responseBody.name).toBe(formData.name);
    expect(responseBody.email).toBe(formData.email);
    expect(responseBody.phone).toBe(formData.phone);
    expect(responseBody.subject).toBe(formData.subject);
    expect(responseBody.description).toBe(formData.description);

});

