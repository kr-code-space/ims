package com.ims.user;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserProvisioningServiceTest {
    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserProvisioningService service;

    @Test
    void listsUsersWithoutExposingPasswordHashes() {
        UserEntity user = user("faculty-a");
        when(userRepository.findAll(any(Sort.class))).thenReturn(List.of(user));

        List<CreatedUserResponse> users = service.findAll();

        assertEquals(1, users.size());
        assertEquals("faculty-a", users.get(0).username());
        assertEquals(UserRole.FACULTY, users.get(0).role());
    }

    @Test
    void disablesOtherAccountButRejectsDisablingCurrentAdmin() {
        UserEntity otherUser = user("student-a");
        when(userRepository.findById(2L)).thenReturn(Optional.of(otherUser));
        when(userRepository.save(otherUser)).thenReturn(otherUser);

        CreatedUserResponse response = service.updateStatus(2L, false, "admin");

        assertFalse(response.enabled());
        assertFalse(otherUser.isEnabled());
        verify(userRepository).save(otherUser);

        UserEntity currentUser = user("admin");
        when(userRepository.findById(1L)).thenReturn(Optional.of(currentUser));
        assertThrows(ResponseStatusException.class, () -> service.updateStatus(1L, false, "admin"));
        verify(userRepository, never()).save(currentUser);
    }

    @Test
    void resetsAnotherUsersPasswordAsHashAndRejectsSelfReset() {
        UserEntity otherUser = user("student-b");
        when(userRepository.findById(3L)).thenReturn(Optional.of(otherUser));
        when(passwordEncoder.encode("temporary-password")).thenReturn("bcrypt-hash");
        when(userRepository.save(otherUser)).thenReturn(otherUser);

        service.resetPassword(3L, "temporary-password", "admin");

        ArgumentCaptor<UserEntity> savedUser = ArgumentCaptor.forClass(UserEntity.class);
        verify(userRepository).save(savedUser.capture());
        assertEquals("bcrypt-hash", savedUser.getValue().getPassword());

        UserEntity currentUser = user("admin");
        when(userRepository.findById(1L)).thenReturn(Optional.of(currentUser));
        assertThrows(ResponseStatusException.class, () ->
                service.resetPassword(1L, "temporary-password", "admin"));
        verify(passwordEncoder, times(1)).encode("temporary-password");
    }

    private UserEntity user(String username) {
        UserEntity user = new UserEntity();
        user.setUsername(username);
        user.setPassword("existing-hash");
        user.setRole(username.startsWith("faculty") ? UserRole.FACULTY : UserRole.STUDENT);
        user.setPermissions(Set.of());
        user.setEnabled(true);
        user.setFirstName("Test");
        user.setLastName("User");
        user.setEmail(username + "@example.com");
        return user;
    }
}
