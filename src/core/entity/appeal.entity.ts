import { BaseEntity } from 'src/common/database';
import { AppealStatus } from 'src/common/enum';
import { Column, Entity } from 'typeorm';

@Entity('appeals')
export class Appeals extends BaseEntity {
  @Column()
  text: string;

  @Column({ nullable: true })
  file: string;

  @Column()
  header: string;

  @Column({ type: 'enum', enum: AppealStatus, default: AppealStatus.ACTIVE })
  status: AppealStatus;

  @Column('simple-array', { nullable: true })
  readBy: string[]; // O'qigan foydalanuvchilar (telegram_id lar massivi)

  @Column('simple-array', { nullable: true })
  unreadBy: string[]; // O'qimagan foydalanuvchilar (telegram_id lar massivi)

  @Column({ nullable: true })
  department: string; // Murojaat yuborilgan bo'lim

  @Column({ nullable: true })
  role: string; // Murojaat yuborilgan role
}
