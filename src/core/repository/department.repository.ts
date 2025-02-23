import { Repository } from 'typeorm';
import { Department } from '../entity/departments.entity';

export type DepartmentRepository = Repository<Department>;
