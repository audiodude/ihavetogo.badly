-- Insert default cities (San Francisco and Boston)
insert into public.cities (name, state, country, bounds) values
('San Francisco', 'CA', 'USA', '{
    "type": "Polygon",
    "coordinates": [[
        [-122.5149, 37.7088],
        [-122.3549, 37.7088],
        [-122.3549, 37.8144],
        [-122.5149, 37.8144],
        [-122.5149, 37.7088]
    ]]
}'),
('Boston', 'MA', 'USA', '{
    "type": "Polygon",
    "coordinates": [[
        [-71.1912, 42.2279],
        [-70.9235, 42.2279],
        [-70.9235, 42.3967],
        [-71.1912, 42.3967],
        [-71.1912, 42.2279]
    ]]
}');

-- Insert default app settings
insert into public.app_settings (key, value) values
('pin_validation_distance_feet', '500'),
('first_invitation_after_reviews', '1'),
('second_invitation_after_reviews', '5'),
('third_invitation_after_reviews', '20'),
('invitation_cooldown_days', '7'),
('default_daily_review_limit', '1');