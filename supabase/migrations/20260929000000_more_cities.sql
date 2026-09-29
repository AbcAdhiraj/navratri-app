-- Expand beyond NCR: Mumbai, Pune and Bangalore.
alter type public.area add value if not exists 'mumbai';
alter type public.area add value if not exists 'pune';
alter type public.area add value if not exists 'bangalore';
