import { Entity, Column } from 'typeorm';
import { BaseEntity } from 'src/common/database';
import { UserStatus } from 'src/common/enum';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Column()
  telegram_id: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  department: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.INACTIVE })
  status: UserStatus;
}
