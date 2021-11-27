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

    const stubClassicScore: Score[] = [
        { name: 'Albert', scoreValue: 10 },
        { name: 'Tristan', scoreValue: 15 },
    ];

    const stubLogScore: Score[] = [
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
        stubStatsService.scoreToDisplay.resolves(stubClassicScore);
        return request(expressApp)
            .get('/api/score/classic')
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
                expect(response.body).to.deep.equal(stubClassicScore);
            });
    });

    it('GET /log/ should return correct scores', async () => {
        stubStatsService.scoreToDisplay.resolves(stubLogScore);
        return request(expressApp)
            .get('/api/score/log')
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
                expect(response.body).to.deep.equal(stubLogScore);
            });
    });

    it('GET /classic/ should return error message if scores undefined', async () => {
        stubStatsService.scoreToDisplay.rejects(stubClassicScore);
        return request(expressApp)
            .get('/api/score/classic')
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.NOT_FOUND);
            });
    });

    it('GET /log/ should return error message if scores undefined', async () => {
        stubStatsService.scoreToDisplay.rejects(stubLogScore);
        return request(expressApp)
            .get('/api/score/log')
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.NOT_FOUND);
            });
    });
});
