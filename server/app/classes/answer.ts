/**
 * @swagger
 *
 * definitions:
 *   Answer:
 *     type: object
 *     properties:
 *       isSuccess:
 *         type: boolean
 *       body:
 *         type: string
 */
export interface Answer {
    isSuccess: boolean;
    body: string;
}
