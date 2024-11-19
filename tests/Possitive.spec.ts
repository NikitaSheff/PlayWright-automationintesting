import {test, expect} from '@playwright/test';
import {RandomHelper} from '../Helpers/playwrightHelper';
import {responseSite} from "../Helpers/mockResponses";
import {loadConfig} from '../Helpers/configPlugin';
import {generateFormData, MessageFormPage} from "../PO/contactForm";
let config: any;

//можно использовать faker.js, как альтернатива ручной генерации
const RandomName: string = `${RandomHelper.getRandomString()} MyName`
const RandomEmail: string = `${RandomHelper.getRandomString()}@random.com`
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

    await expect(page.locator("div[class='col-sm-10'] h2").first()).toBeVisible();
    await expect(page.locator('.row.contact').first()).toContainText('Thanks for getting in touch');
    await expect(page.locator('.row.contact').first()).toContainText(config.subjectText);
});

test('API - Submit contact form via API', async ({ request }) => {

    const formData = generateFormData();

    // Отправка POST запроса с данными формы
    const response = await request.post('/message/', {
        data: formData
    });
    expect([200, 201]).toContain(response.status());
    const responseBody = await response.json();

    // Лог для проверки тела ответа
    console.log('Response Body:', responseBody);
    expect(responseBody).toBeDefined();
    expect(Object.keys(responseBody).length).toBeGreaterThan(0);
    expect(responseBody).toMatchObject(responseSite);

    const expectedFields = ['name', 'email', 'phone', 'subject', 'description'];
    expectedFields.forEach(field => {
        expect(responseBody[field]).toBe(formData[field]);
    });

});


