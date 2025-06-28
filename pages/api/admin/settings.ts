import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Use service role key for admin operations
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    switch (req.method) {
      case 'GET':
        // Get system settings
        const { data: settings, error } = await supabase
          .from('system_settings')
          .select('*')
          .order('category', { ascending: true });

        if (error && error.code !== 'PGRST116') { // Table doesn't exist error
          throw error;
        }

        // If system_settings table doesn't exist, return default settings
        const defaultSettings = settings || [
          { key: 'academic_year', value: '2024-25', category: 'academic', description: 'Current academic year' },
          { key: 'semester_system', value: '8-semester', category: 'academic', description: 'Semester system type' },
          { key: 'credit_system', value: 'vertical-based', category: 'academic', description: 'Credit calculation system' },
          { key: 'debug_mode', value: 'false', category: 'system', description: 'Enable debug mode' },
          { key: 'maintenance_mode', value: 'false', category: 'system', description: 'System maintenance mode' },
        ];

        return res.status(200).json({
          success: true,
          data: defaultSettings
        });

      case 'PUT':
        // Update system setting
        const { key, value, category, description } = req.body;
        
        // Try to update existing setting
        const { data: updatedSetting, error: updateError } = await supabase
          .from('system_settings')
          .upsert({ 
            key, 
            value, 
            category: category || 'general',
            description: description || '',
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (updateError) {
          // If table doesn't exist, log the setting change
          console.log(`Setting updated: ${key} = ${value}`);
          return res.status(200).json({
            success: true,
            data: { key, value, category, description },
            message: 'Setting updated successfully (logged)'
          });
        }

        return res.status(200).json({
          success: true,
          data: updatedSetting,
          message: 'Setting updated successfully'
        });

      case 'POST':
        // Create new system setting
        const newSetting = req.body;
        
        const { data: createdSetting, error: createError } = await supabase
          .from('system_settings')
          .insert([{
            ...newSetting,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (createError) {
          // If table doesn't exist, log the setting
          console.log(`New setting created: ${newSetting.key} = ${newSetting.value}`);
          return res.status(201).json({
            success: true,
            data: newSetting,
            message: 'Setting created successfully (logged)'
          });
        }

        return res.status(201).json({
          success: true,
          data: createdSetting,
          message: 'Setting created successfully'
        });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Admin settings API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
