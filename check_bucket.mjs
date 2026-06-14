import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("Missing Supabase env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBucket() {
  const { data, error } = await supabase.storage.getBucket('diary-images');
  if (error) {
    console.error("Error getting bucket:", error);
  } else {
    console.log("Bucket details:", data);
    if (!data.public) {
      console.log("Bucket is NOT public! Updating to public...");
      const { data: updateData, error: updateError } = await supabase.storage.updateBucket('diary-images', {
        public: true
      });
      if (updateError) {
        console.error("Error updating bucket:", updateError);
      } else {
        console.log("Bucket updated to public:", updateData);
      }
    } else {
      console.log("Bucket is already public.");
    }
  }
}

checkBucket();
