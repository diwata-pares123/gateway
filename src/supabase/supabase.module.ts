import { Global, Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Global() // 👈 IMPORTANTE ITO PAPS! Ito ang nagpapa-global sa module
@Module({
  providers: [SupabaseService],
  exports: [SupabaseService], // 👈 Importante din para mai-share palabas ang service
})
export class SupabaseModule {}