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
        const { type } = req.query;
        
        if (type === 'universities') {
          const { data: universities, error } = await supabase
            .from('universities')
            .select('*')
            .order('name', { ascending: true });

          if (error) throw error;
          
          return res.status(200).json({
            success: true,
            data: { universities: universities || [] }
          });
          
        } else if (type === 'departments') {
          const { data: departments, error } = await supabase
            .from('departments')
            .select(`
              *,
              universities!inner(name)
            `)
            .order('name', { ascending: true });

          if (error) throw error;
          
          return res.status(200).json({
            success: true,
            data: { departments: departments || [] }
          });
          
        } else if (type === 'programs') {
          const { data: programs, error } = await supabase
            .from('degree_programs')
            .select(`
              *,
              universities!inner(name),
              departments(name)
            `)
            .order('name', { ascending: true });

          if (error) throw error;
          
          return res.status(200).json({
            success: true,
            data: { programs: programs || [] }
          });
          
        } else if (type === 'branches') {
          const { data: branches, error } = await supabase
            .from('branches')
            .select(`
              *,
              degree_programs!inner(name),
              departments(name)
            `)
            .order('name', { ascending: true });

          if (error) throw error;
          
          return res.status(200).json({
            success: true,
            data: { branches: branches || [] }
          });
          
        } else if (type === 'verticals') {
          const { data: verticals, error } = await supabase
            .from('academic_verticals')
            .select(`
              *,
              universities!inner(name)
            `)
            .order('code', { ascending: true });

          if (error) throw error;
          
          return res.status(200).json({
            success: true,
            data: { verticals: verticals || [] }
          });
          
        } else {
          // Get overview of all academic structures
          const [unis, depts, progs, branches, verts] = await Promise.all([
            supabase.from('universities').select('id, name'),
            supabase.from('departments').select('id, name'),
            supabase.from('degree_programs').select('id, name'),
            supabase.from('branches').select('id, name'),
            supabase.from('academic_verticals').select('id, code, name')
          ]);

          return res.status(200).json({
            success: true,
            data: {
              overview: {
                universities: unis.data || [],
                departments: depts.data || [],
                programs: progs.data || [],
                branches: branches.data || [],
                verticals: verts.data || []
              }
            }
          });
        }

      case 'POST':
        // Create new academic structure
        const { structureType, ...structureData } = req.body;
        let tableName = '';
        
        switch (structureType) {
          case 'university':
            tableName = 'universities';
            break;
          case 'department':
            tableName = 'departments';
            break;
          case 'program':
            tableName = 'degree_programs';
            break;
          case 'branch':
            tableName = 'branches';
            break;
          case 'vertical':
            tableName = 'academic_verticals';
            break;
          default:
            return res.status(400).json({ error: 'Invalid structure type' });
        }

        const { data: newItem, error: createError } = await supabase
          .from(tableName)
          .insert([structureData])
          .select()
          .single();

        if (createError) throw createError;

        return res.status(201).json({
          success: true,
          data: newItem,
          message: `${structureType} created successfully`
        });

      case 'PUT':
        // Update academic structure
        const { id, structureType: updateType, ...updateData } = req.body;
        let updateTableName = '';
        
        switch (updateType) {
          case 'university':
            updateTableName = 'universities';
            break;
          case 'department':
            updateTableName = 'departments';
            break;
          case 'program':
            updateTableName = 'degree_programs';
            break;
          case 'branch':
            updateTableName = 'branches';
            break;
          case 'vertical':
            updateTableName = 'academic_verticals';
            break;
          default:
            return res.status(400).json({ error: 'Invalid structure type' });
        }

        const { data: updatedItem, error: updateError } = await supabase
          .from(updateTableName)
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (updateError) throw updateError;

        return res.status(200).json({
          success: true,
          data: updatedItem,
          message: `${updateType} updated successfully`
        });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Admin academic structures API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
