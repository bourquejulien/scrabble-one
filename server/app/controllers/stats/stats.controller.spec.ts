/* eslint-disable dot-notation */
import { Application } from '@app/app';
import { Constants } from '@app/constants';
import { Score } from '@common';
import { StatsService } from 'app/services/stats/stats.service';
import { expect } from 'chai';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import request from 'supertest';
import { Container } from 'typedi';

describe('StatsController', () => {
    let stubStatsService: SinonStubbedInstance<StatsService>;
    let expressApp: Express.Application;

    const classicScore: Score[] = [
        { name: 'Albert', scoreValue: 10 },
        { name: 'Tristan', scoreValue: 15 },
    ];

    const logScore: Score[] = [
        { name: 'Bruce', scoreValue: 20 },
        { name: 'Wayne', scoreValue: 25 },
    ];

    beforeEach(() => {
        stubStatsService = createStubInstance(StatsService);
        const app = Container.get(Application);
        Object.defineProperty(app['statsController'], 'statsService', { value: stubStatsService });
        expressApp = app.app;
    });

    it('GET /classic/ should return correct scores', async () => {
        stubStatsService.scoreToDisplay.resolves(classicScore);
        return request(expressApp)
            .get('/api/score/classic')
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
                expect(response.body).to.deep.equal(classicScore);
            });
    });

    it('GET /log/ should return correct scores', async () => {
        stubStatsService.scoreToDisplay.resolves(logScore);
        return request(expressApp)
            .get('/api/score/log')
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
                expect(response.body).to.deep.equal(logScore);
            });
    });

    it('GET /classic/ should return error message if scores undefined', async () => {
        stubStatsService.scoreToDisplay.rejects(classicScore);
        return request(expressApp)
            .get('/api/score/classic')
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.NOT_FOUND);
            });
    });

    it('GET /log/ should return error message if scores undefined', async () => {
        stubStatsService.scoreToDisplay.rejects(logScore);
        return request(expressApp)
            .get('/api/score/log')
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.NOT_FOUND);
            });
    });
});
