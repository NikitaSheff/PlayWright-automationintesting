import { Page } from '@playwright/test';

export class MessageFormPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async fillForm(data: { name: string; email: string; phone: string; subject: string; description: string }) {
        await this.page.locator('#name').fill(data.name);
        await this.page.locator('#email').fill(data.email);
        await this.page.locator('#phone').fill(data.phone);
        await this.page.locator('#subject').fill(data.subject);
        await this.page.locator('#description').fill(data.description);
    }
}
