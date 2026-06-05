
CREATE POLICY "Auth read employee-contracts" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'employee-contracts');
CREATE POLICY "Auth write employee-contracts" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'employee-contracts');
CREATE POLICY "Auth update employee-contracts" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'employee-contracts');
CREATE POLICY "Auth delete employee-contracts" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'employee-contracts');

CREATE POLICY "Auth read expense-receipts" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'expense-receipts');
CREATE POLICY "Auth write expense-receipts" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'expense-receipts');
CREATE POLICY "Auth update expense-receipts" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'expense-receipts');
CREATE POLICY "Auth delete expense-receipts" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'expense-receipts');
