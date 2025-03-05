import { Repository } from 'typeorm';
import { Appeals } from '../entity/appeal.entity';

export type AppealRepository = Repository<Appeals>;
