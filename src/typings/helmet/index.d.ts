declare module "helmet" {
    import type { Express } from "express";
    export default function (): Express;
}
