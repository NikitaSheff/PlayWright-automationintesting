import {expect} from "@playwright/test";

export const responseSite = {
    messageid: expect.any(Number), // Используем для проверки числа
    name: expect.any(String),
    email: expect.any(String),
    phone: expect.any(String),
    subject: expect.any(String),
    description: expect.any(String)
}
