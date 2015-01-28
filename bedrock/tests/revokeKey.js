var bedrock = GLOBAL.bedrock;

describe('revoke key', function() {
  var sysIdentifier = bedrock.randomString().toLowerCase();
  var email = sysIdentifier + '@bedrock.dev';
  var password = 'password';

  it('should create a new identity', function() {
    bedrock.pages.join.get().createIdentity({
      email: email,
      label: sysIdentifier,
      password: password
    });
  });

  it('should generate a key', function() {
    bedrock.pages.settings.get(sysIdentifier).generateKey({label: 'To Revoke'});
  });

  it('should revoke a key', function() {
    bedrock.pages.settings.get(sysIdentifier).revokeKey({label: 'To Revoke'});
  });

  it('should logout', function() {
    bedrock.logout();
  });
});
