import { Goal } from '@app/classes/goal/base-goal';

type Generator = { generate(ownerId: string): Goal };

export const goalGenerators: Generator[] = [];

export const goalGenerator = <T extends Generator>(constructor: T) => {
    goalGenerators.push(constructor);
};
