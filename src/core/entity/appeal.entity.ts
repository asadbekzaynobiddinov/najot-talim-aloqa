import { BaseEntity } from 'src/common/database';
import { Column, Entity } from 'typeorm';

@Entity('appeals')
export class Appeals extends BaseEntity {
  @Column()
  text: string;

  @Column({ nullable: true })
  file: string;

  @Column('simple-array', { nullable: true })
  readBy: string[]; // O'qigan foydalanuvchilar (telegram_id lar massivi)

  @Column('simple-array', { nullable: true })
  unreadBy: string[]; // O'qimagan foydalanuvchilar (telegram_id lar massivi)

  @Column({ nullable: true })
  department: string; // Murojaat yuborilgan bo'lim

  @Column({ nullable: true })
  role: string; // Murojaat yuborilgan role
}
