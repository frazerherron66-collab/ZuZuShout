import { supabase } from './index'; // Adjust this path to match your Supabase initialization file

export async function verifyAndLinkDevice(parentUid: string, pairingCode: string) {
  // 1. Find the child profile that owns that 6-digit pairing code
  const { data: childProfile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('pairing_code', pairingCode)
    .single();

  if (profileError || !childProfile) {
    throw new Error('Invalid pairing code. Please check the screen on the child device.');
  }

  // 2. Insert the pairing row into your links table
  const { data: linkData, error: linkError } = await supabase
    .from('parent_child_links')
    .insert([
      { parent_id: parentUid, child_id: childProfile.id }
    ])
    .select();

  if (linkError) throw linkError;
  return linkData;
}