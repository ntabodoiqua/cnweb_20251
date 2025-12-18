package com.cnweb.order_service.repository;

import com.cnweb.order_service.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, String> {
    
    Optional<Cart> findByUserName(String userName);
    
    void deleteByUserName(String userName);
}
