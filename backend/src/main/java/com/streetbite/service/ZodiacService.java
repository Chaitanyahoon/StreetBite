package com.streetbite.service;

import com.streetbite.dto.zodiac.ZodiacChallengeResponse;
import com.streetbite.dto.zodiac.ZodiacHoroscopeResponse;
import com.streetbite.dto.zodiac.ZodiacSignResponse;
import com.streetbite.model.User;
import com.streetbite.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ZodiacService {

        private final UserRepository userRepository;

        public ZodiacService(UserRepository userRepository) {
                this.userRepository = userRepository;
        }

        private static final Map<String, List<String>> PREDICTIONS = new HashMap<>();
        private static final Map<String, List<String>> LUCKY_DISHES = new HashMap<>();
        private static final List<String> CHALLENGES = List.of(
                        "Try something under ₹80",
                        "Eat something spicy 🌶",
                        "Try a food you’ve never eaten before",
                        "Order a drink instead of food",
                        "Try something your friend recommends",
                        "Share a meal with a stranger",
                        "Find a vendor with a blue stall",
                        "Eat something sweet before spicy",
                        "Compliment the chef",
                        "Take a photo of your food before eating");

        static {
                PREDICTIONS.put("Aries", List.of(
                                "Your plate will look better than everyone else’s.",
                                "Spicy food is your best friend today.",
                                "Don't hesitate to ask for extra chutney."));
                PREDICTIONS.put("Taurus", List.of(
                                "Comfort food will bring you great joy.",
                                "Stick to your favorites today.",
                                "A sweet treat is in your future."));
                PREDICTIONS.put("Gemini", List.of(
                                "Try two different dishes today.",
                                "Share your food with a friend.",
                                "Experiment with a new flavor."));
                PREDICTIONS.put("Cancer", List.of(
                                "Eat something that reminds you of home.",
                                "Emotional eating is allowed today.",
                                "Soup or broth will be very satisfying."));
                PREDICTIONS.put("Leo", List.of(
                                "Your plate will look better than everyone else’s.",
                                "You deserve the best table.",
                                "Show off your food on social media."));
                PREDICTIONS.put("Virgo", List.of(
                                "Today you will judge the cleanliness of the stall… silently.",
                                "Check the hygiene rating before ordering.",
                                "A balanced meal will keep you focused."));
                PREDICTIONS.put("Libra", List.of(
                                "Balance your meal with sweet and savory.",
                                "Dining with company is better than alone.",
                                "Presentation matters today."));
                PREDICTIONS.put("Scorpio", List.of(
                                "Someone will take your bite… revenge is optional.",
                                "Try something with a hidden kick.",
                                "A dark chocolate dessert is perfect."));
                PREDICTIONS.put("Sagittarius", List.of(
                                "Explore a new cuisine today.",
                                "Street food adventure awaits.",
                                "Eat something you can't pronounce."));
                PREDICTIONS.put("Capricorn", List.of(
                                "Stick to the classics.",
                                "Value for money is key today.",
                                "A hearty meal will power you through."));
                PREDICTIONS.put("Aquarius", List.of(
                                "Combine unusual ingredients.",
                                "Drink plenty of water with your meal.",
                                "Eat at an odd time."));
                PREDICTIONS.put("Pisces", List.of(
                                "You will fall in love with chai again.",
                                "Follow your intuition when ordering.",
                                "A dreamy dessert will end the day right."));

                LUCKY_DISHES.put("Aries", List.of("Vada Pav", "Spicy Wings", "Chilli Paneer"));
                LUCKY_DISHES.put("Taurus", List.of("Burger", "Fries", "Chocolate Shake"));
                LUCKY_DISHES.put("Gemini", List.of("Sandwich", "Tacos", "Momos"));
                LUCKY_DISHES.put("Cancer", List.of("Soup", "Khichdi", "Ice Cream"));
                LUCKY_DISHES.put("Leo", List.of("Pizza", "Steak", "Fancy Cake"));
                LUCKY_DISHES.put("Virgo", List.of("Salad", "Fruit Bowl", "Smoothie"));
                LUCKY_DISHES.put("Libra", List.of("Dahi Puri", "Sushi", "Cupcake"));
                LUCKY_DISHES.put("Scorpio", List.of("Curry", "Dark Chocolate", "Espresso"));
                LUCKY_DISHES.put("Sagittarius", List.of("Shawarma", "Burrito", "Falafel"));
                LUCKY_DISHES.put("Capricorn", List.of("Thali", "Rice Bowl", "Coffee"));
                LUCKY_DISHES.put("Aquarius", List.of("Fusion Food", "Bubble Tea", "Wrap"));
                LUCKY_DISHES.put("Pisces", List.of("Cold Coffee", "Fish Fry", "Donut"));
        }

        public ZodiacHoroscopeResponse getDailyHoroscope(String zodiacSign) {
                if (zodiacSign == null || !PREDICTIONS.containsKey(zodiacSign)) {
                        return null;
                }

                int dayOfYear = LocalDate.now().getDayOfYear();
                int signIndex = Math.abs(zodiacSign.hashCode());

                List<String> signPredictions = PREDICTIONS.get(zodiacSign);
                String prediction = signPredictions.get((dayOfYear + signIndex) % signPredictions.size());

                List<String> signDishes = LUCKY_DISHES.get(zodiacSign);
                String luckyDish = signDishes.get((dayOfYear + signIndex) % signDishes.size());

                String challenge = CHALLENGES.get((dayOfYear + signIndex) % CHALLENGES.size());

                int hour = (dayOfYear + signIndex) % 12 + 1;
                int minute = (dayOfYear * signIndex) % 60;
                String ampm = ((dayOfYear + signIndex) % 24) >= 12 ? "PM" : "AM";
                String luckyTime = String.format("%d:%02d %s", hour, minute, ampm);

                ZodiacHoroscopeResponse result = new ZodiacHoroscopeResponse();
                result.setZodiacSign(zodiacSign);
                result.setPrediction(prediction);
                result.setLuckyDish(luckyDish);
                result.setLuckyTime(luckyTime);
                result.setChallenge(challenge);
                return result;
        }

        public ZodiacSignResponse updateUserZodiac(Long userId, String zodiacSign) {
                User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
                user.setZodiacSign(zodiacSign);
                User updated = userRepository.save(user);
                return new ZodiacSignResponse(updated.getId(), updated.getZodiacSign());
        }

        public ZodiacChallengeResponse completeChallenge(Long userId) {
                User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
                user.setXp((user.getXp() == null ? 0 : user.getXp()) + 10);
                User updated = userRepository.save(user);
                return new ZodiacChallengeResponse("Challenge completed", updated.getXp());
        }
}
