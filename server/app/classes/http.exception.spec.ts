import { HttpException } from './http.exception';
import { expect } from 'chai';

describe('HttpException', () => {
    it('should create a simple HTTPException', () => {
        const createdMessage = 'Course created successfuly';
        const httpException: HttpException = new HttpException(createdMessage);

        expect(httpException.message).to.equals(createdMessage);
    });
});
